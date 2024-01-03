// src/scraper.js
const cheerio = require("cheerio");
const axios = require("axios");
const router = require("express").Router();
const {
  generateFilename,
  saveProductJson,
  generateTitle,
  buildQuery,
  getJsonData,
} = require("./utils");
const { query } = require("express");

const baseUrl = "https://www.mangaworld.bz";

router.get("/archive", (req, res) => {
  const paramQuery = buildQuery(req.query);
  const url = baseUrl + "/archive?" + paramQuery;
  try {
    // Get the HTML from the URL
    axios.get(url).then((response) => {
      const $ = cheerio.load(response.data);

      const scriptElement = $('script:contains("$MC")');
      const scriptContent = scriptElement.html();
      const matches = scriptContent.match(/.concat\(([\s\S]*)/);

      var parsedString = matches[0].replace(".concat(", "");
      parsedString = parsedString.slice(0, -1);

      const obj = JSON.parse(parsedString);
      // saveProductJson(obj)
      const mangas = obj.o.w[2][2].mangas;
      const totalmangas = obj.o.w[2][2].results;
      const data = mangas.map((manga) => {
        return {
          author: manga.author,
          artist: manga.artist,
          genres: manga.genres.map((element) => element.name),
          references: {
            mangaupdatesId: manga.references.mangaupdatesId,
            mangadexId: manga.references.mangadexId,
            anilistId: manga.references.anilistId,
            malId: manga.references.malId,
          },
          animeLink: manga.animeLink,
          title: manga.title,
          status: manga.status,
          type: manga.type,
          plot: manga.trama,
          year: manga.year,
          volumesCount: manga.volumesCount,
          chaptersCount: manga.chaptersCount,
          id: manga.id,
          image: manga.imageT,
          linkId: manga.linkId,
        };
      });

      const pages = obj.o.w[19];
      let prevPage = null;
      let nextPage = null;
      let page = 1;
      let totalPages = page;
      if (pages) {
        totalPages = pages[2]?.totalPages;
        page = pages[2].page;

        if (page != 1) {
          const prevPageNumb = page - 1;
          req.query.page = prevPageNumb;
          newQueryparams = buildQuery(req.query);
          prevPage = "http://localhost:3000/archive?" + newQueryparams;
        }
        if (page != totalPages) {
          const nextPageNumb = page + 1;
          req.query.page = nextPageNumb;
          newQueryparams = buildQuery(req.query);
          nextPage = "http://localhost:3000/archive?" + newQueryparams;
        }
      }

      const responseobj = {
        totalmangas,
        totalPages,
        page,
        prevPage,
        nextPage,
        data,
      };

      // Call the saveProductJson function to save the products array to a JSON file

      res.json(responseobj);
    });
  } catch (error) {
    res.statusCode(500).json({
      message: "Error scraping products",
      error: error.message,
    });
  }
});

router.get("/manga/:id", (req, res) => {
  const url = baseUrl + "/manga/" + req.params.id;

  try {
    axios.get(url).then((response) => {
      const $ = cheerio.load(response.data);

      const scriptElement = $('script:contains("$MC")');
      const scriptContent = scriptElement.html();
      const matches = scriptContent.match(/.concat\(([\s\S]*)/);

      var parsedString = matches[0].replace(".concat(", "");
      parsedString = parsedString.slice(0, -1);

      const obj = JSON.parse(parsedString);

      const manga = obj.o.w[0][2].manga;
      const volumes = obj.o.w[3][2].pages.volumes;
      // saveProductJson(volumes)

      const data = volumes.map((volume) => {
        return {
          name: volume.volume.name,
          chapters: volume.chapters.map((chapter) => {
            return {
              name: chapter.name,
              numberPages: chapter.pages.length,
              pages: chapter.pages.map(
                (page) =>
                  "https://cdn.mangaworld.bz/chapters/" +
                  manga.slugFolder +
                  "-" +
                  manga.id +
                  "/" +
                  volume.volume.slugFolder +
                  "-" +
                  volume.volume.id +
                  "/" +
                  chapter.slugFolder +
                  "-" +
                  chapter.id +
                  "/" +
                  page
              ),
            };
          }),
        };
      });

      responseobj = {
        data,
      };

      res.json(responseobj);
    });
  } catch (error) {
    res.statusCode(500).json({
      message: "Error scraping products",
      error: error.message,
    });
  }
});
router.get("/authors", (req, res) => {
  const url = baseUrl + "/archive";

  try {
    axios.get(url).then((response) => {
      const obj = getJsonData(response.data);

      const authors = obj.o.w[2][2].authors;

      const data = authors;
      const totalAuthors = data.length;
      const responseobj = {
        data,
        totalAuthors,
      };

      res.json(responseobj);
    });
  } catch (error) {
    res.statusCode(500).json({
      message: "Error scraping products",
      error: error.message,
    });
  }
});
router.get("/artists", (req, res) => {
  const url = baseUrl + "/archive";

  try {
    axios.get(url).then((response) => {
      const obj = getJsonData(response.data);

      const artists = obj.o.w[2][2].artists;

      const data = artists;
      const totalArtists = data.length;
      const responseobj = {
        data,
        totalArtists,
      };

      res.json(responseobj);
    });
  } catch (error) {
    res.statusCode(500).json({
      message: "Error scraping products",
      error: error.message,
    });
  }
});
router.get("/years", (req, res) => {
  const url = baseUrl + "/archive";

  try {
    axios.get(url).then((response) => {
      const obj = getJsonData(response.data);

      const years = obj.o.w[2][2].years;

      const data = years;
      const totalYears = data.length;
      const responseobj = {
        data,
        totalYears,
      };

      res.json(responseobj);
    });
  } catch (error) {
    res.statusCode(500).json({
      message: "Error scraping products",
      error: error.message,
    });
  }
});
router.get("/genres", (req, res) => {
  const url = baseUrl + "/archive";

  try {
    axios.get(url).then((response) => {
      const obj = getJsonData(response.data);

      const genres = obj.o.w[1][2].globalData.genres;
      const data = genres.map((genre) => {
        return {
          name: genre.name,
          slug: genre.slug,
        };
      });

      const totalGenres = data.length;
      const responseobj = {
        data,
        totalGenres,
      };

      res.json(responseobj);
    });
  } catch (error) {
    res.statusCode(500).json({
      message: "Error scraping products",
      error: error.message,
    });
  }
});
router.get("/status", (req, res) => {
  const status = ["ongoing", "completed", "dropped", "paused", "canceled"];
  const data = status;

  const totalStatus = data.length;
  const responseobj = {
    data,
    totalStatus,
  };

  res.json(responseobj);
});
router.get("/status", (req, res) => {
  const status = ["ongoing", "completed", "dropped", "paused", "canceled"];
  const data = status;

  const totalStatus = data.length;
  const responseobj = {
    data,
    totalStatus,
  };

  res.json(responseobj);
});

// Export the router so it can be used in the server.js file
module.exports = router;

'use strict';

const fs = require('fs');
const _ = require('lodash');
const request = require('request-promise');
const API_KEY = '426994ba';
const BASE_URL = 'http://www.omdbapi.com';

const CONFIG = require('./config.json');
const PATH = CONFIG.moviesPath;
const MOVIES = fs.readdirSync(PATH);

MOVIES.forEach(movie => {
  let title = _.trim(_.head(movie.match(/^[\w+ ]+/g)));
  let year = _.last(/\((\d+)\)/g.exec(movie));
  console.log(title, year);
  (async function() {
    let options = {
      uri: BASE_URL,
      qs: {
        apikey: API_KEY,
        t: title,
        y: year,
        type: 'movie'
      },
      json: true // Automatically parses the JSON string in the response
    };
    try {
      let res = await request(options);
      let { imdbRating, Genre, Rated, Poster } = res;

      Poster = Poster === 'N/A' ? null : Poster;
      imdbRating = imdbRating === 'N/A' ? '' : imdbRating;
      Rated = Rated === 'N/A' ? '' : Rated;

      fs.writeFileSync(
        `${PATH}/${movie}/R: ${imdbRating} - ${Genre} - ${Rated} .json`,
        JSON.stringify(res, null, 2)
      );

      if (Poster) {
        fs.writeFileSync(
          `${PATH}/${movie}/R: ${imdbRating} - ${Genre} - ${Rated} .jpg`,
          await request(Poster, { encoding: 'binary' }),
          { encoding: 'binary' }
        );
      }
    } catch (e) {
      console.log(e);
    }
  })();
});

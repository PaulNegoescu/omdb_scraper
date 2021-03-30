import * as fs from 'fs/promises';
import yargs from 'yargs';
import axios from 'axios';

const argv = yargs(process.argv.slice(2))
  .option('file', {
    alias: 'f',
    description: 'The json file to parse for titles or IMDB ids',
    type: 'string',
  })
  .option('type', {
    alias: 't',
    description: "The type of data in the json, either 'imdb' or 'title'",
    type: 'string',
  })
  .option('out', {
    alias: 'o',
    description: 'Filepath of the output file',
    type: 'string',
  })
  .help()
  .alias('help', 'h').argv;

(async function main() {
  const mainUrl = `https://www.omdbapi.com/?apikey=${process.env.API_KEY}&plot=full&`;
  const url = {
    title: `${mainUrl}t=`,
    imdb: `${mainUrl}i=`,
  };

  let { file, type, out } = argv;
  if (!file) {
    throw new Error('Please specify an input file!');
  }

  type = type || 'title';
  out = out || 'out.json';

  const data = JSON.parse(await fs.readFile(file, { encoding: 'utf8' }));

  const promises = [];
  for (const item of data) {
    promises.push(axios(url[type] + encodeURIComponent(item)));
  }

  const movies = (await Promise.allSettled(promises))
    .filter((item, index) => {
      if (item.status === 'fulfilled') {
        return true;
      }
      console.error(`Errored out for '${data[index]}'`, item);
      return false;
    })
    .map((item) => item.value.data)
    .filter((movie, index) => {
      if (movie.Response === 'True') {
        return true;
      }
      console.error(`Failed to get '${data[index]}'`);
      return false;
    })
    .map(normalizeKeysAndValues);

  await fs.writeFile(out, JSON.stringify(movies));
})();

function normalizeKeysAndValues(movie) {
  const newMovie = {};
  for (let [key, value] of Object.entries(movie)) {
    if (key !== 'Response') {
      key = key.toLowerCase();

      if (key === 'released' || key === 'dvd') {
        value = Date.parse(value) || value;
      } else if (key === 'imdbvotes' || key === 'boxoffice') {
        value = Number(value.replaceAll(/[\$,]/g, '')) || value;
      } else if (key === 'runtime') {
        value = parseInt(value, 10);
      }

      if (value === 'N/A') {
        value = null;
      } else if (Array.isArray(value)) {
        value = value.map(normalizeKeysAndValues);
      } else if (value == Number(value)) {
        value = Number(value);
      }

      newMovie[key] = value;
    }
  }
  return newMovie;
}

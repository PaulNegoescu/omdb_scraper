# OMDB Scraper

This is a small script to scrape movies from OMDB in a normalized format. It takes as an input either a JSON file with an array of titles or a JSON file with an array of IMDB ids. As an output you get a JSON file with all the data OMDB returns for all the titles or ids in the input file, including full plot.

## Usage

Create an `.env` file in your project with the following content:

```
API_KEY=your_omdb_api_key
```

Afterwards run these commands:

```
# First time only
npm install

# Then Every time
npm start -- -f titles.json -t title -o db.json
```

Remember to replace titles.json with the path to your json input file.

## Options

`-f`/`--file` - Input json file holding a valid array of either titles or imdb ids

`-t`/`--type` - Should be either `title` or `imdb` depending on the input file content

`-o`/`--out` - The output file

`-h`/`--help` - Display all options with descriptions

## Useful

A short script to snatch titles off of IMDB result pages ([configure this one for top 1000 for example](https://www.imdb.com/search/title/)):

```
const titles = Array.from(document.querySelectorAll('.lister-item-header'), header => header.querySelector('a').innerText);
```

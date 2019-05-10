# Hacker News Feed

> Feed of the latest stories from [Hacker News](https://news.ycombinator.com) using the [Hacker News API](https://github.com/HackerNews/API)

A running demo is available at https://hackernewsfeed.steev.dev

## Installation

```
git clone git@github.com:steevsachs/hackernewsfeed.git
cd hackernewsfeed
yarn install
```

## Run the app

### Development

```
yarn dev
```

### Production

```
yarn build
yarn start
```

The app will run by default at `http://localhost.com:8080`

## Test

`yarn test`

## Description

By default, the app will fetch the list of the latest 500 story item ids from HN.

As you scroll down, new items will first be fetched from those 500 ids.

Once the 500 ides are exhausted, new items will be fetched from HN history in batches of 20 by decrementing the latest story id.
Fetches from history will take longer than fetches from the first cached 500 items because the application is speculatively fetching items to find story content.

## Credits

Colors and styling are taken from / based on [Todoist](https://todoist.com)

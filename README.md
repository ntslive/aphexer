# Aphexer

The Aphexer aphexes your image.

## Development

### Setup

```
brew update && brew install opencv
npm install
```

### Boot

```
npm start
```

## Deployment (Heroku)

### Setup

```
heroku plugins:install heroku-container-registry
heroku container:login
```

### Deploy

```
heroku container:push web
```

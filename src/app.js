require('dotenv').config();
const path = require('path');

const express = require('express');
const swaggerUi = require('swagger-ui-express');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { errors } = require('celebrate');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const mainRouter = require('./routes/index');
const wrongAddress = require('./routes/wrongAddress');
const { errorsHandler } = require('./middlewares/errorsHandler');
const config = require('./config.js');

const swaggerOptions = require('./swagger.json');

const app = express();

app.use('/', express.static(path.join(__dirname, 'public')));

// Swagger auto documentation set up
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerOptions));

app.use(helmet());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose
  .connect('mongodb://mongo:27017/test-chat-DB', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .catch((err) => {
    console.error(err);
  });

app.listen(config.PORT, () => {});
// antiDDOS limiter
app.use(config.limiter);
// logging all requests to request.loq file
app.use(requestLogger);

// login, auth and all other router
app.use('/api', mainRouter);
// logging all errors to error.log file
app.use(errorLogger);
// errors handlers
app.use(errors()); // celebrate's errors handler
app.use(wrongAddress);
app.use(errorsHandler); // custom errors handler

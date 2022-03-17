const express = require('express');
const serverStatic = require('serve-static');
const path = require('path');

const app = express();

const port = process.env.PORT || 8080
app.listen(port);

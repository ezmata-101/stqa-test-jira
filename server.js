const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

app.use('/auth',     require('./routes/auth'));
app.use('/users',    require('./routes/users'));
app.use('/teams',    require('./routes/teams'));
app.use('/projects', require('./routes/projects'));
app.use('/issues',   require('./routes/issues'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


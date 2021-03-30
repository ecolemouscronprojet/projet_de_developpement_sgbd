const { Db, ObjectID } = require("mongodb");

module.exports = (app, db) => {
  if (!(db instanceof Db)) {
    throw new Error("Invalid Database");
  }
  const classeCollection = db.collection("classes");

  const addClasses = async(req, res)  => {
    const data = req.body;
    
    data.start_date = new Date(data.start_date);
    data.end_date = new Date(data.end_date);
    data.users = data.users.map(uId => new ObjectID(uId));

    const response = await classeCollection.insertOne(data);
    // result: { n: 1, ok: 1 },

    if(response.result.n !== 1 || response.result.ok !== 1) {
      res.status(400).json({error: 'Impossible to save this classe ! '});
    }

    res.json(response.ops[0]);
  };

  app.post('/classes', addClasses);

};

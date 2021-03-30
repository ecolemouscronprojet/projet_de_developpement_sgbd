const { Db, ObjectID } = require("mongodb");

module.exports = (app, db) => {
  if (!(db instanceof Db)) {
    throw new Error("Invalid Database");
  }
  const userCollection = db.collection("users");

  app.post("/users", async (req, res) => {
    const data = req.body;
    try {
      data.active = data.active === 'true';
      data.birthday = new Date(data.birthday);
      const response = await db.collection("users").insertOne(data);
      if (response.result.n !== 1 && response.result.ok !== 1) {
        return res.status(400).json({ error: "impossible to create the user" });
      }
      const user = response.ops[0];
      
      res.json(user);
    } catch(e) {
      console.log(e);
      return res.status(400).json({ error: "impossible to create the user" });
    }

  });

  // lister tous les utilisateurs
  app.get("/users", async (req, res) => {
    const users = await userCollection.find().toArray();

    res.json(users);
  });

  // lister un utilisateeur
  app.get("/users/:userId", async (req, res) => {
    const { userId } = req.params;
    const _id = new ObjectID(userId);
    const user = await userCollection.findOne({ _id });
    if (user == null) {
      return res.status(404).send({ error: "Impossible to find this user" });
    }

    res.json(user);
  });

  // Créer un utilisateur
  app.post("/users", async (req, res) => {
    const data = req.body;
    const response = await userCollection.insertOne(data);
    if (response.result.n !== 1 && response.result.ok !== 1) {
      return res.status(400).json({ erro: "impossible to create the user" });
    }

    //const user = response.ops[0];
    const [user] = response.ops;

    res.json(user);
  });

  // Mettre à jour un utilisateur
  app.post("/users/:userId", async (req, res) => {
    const { userId } = req.params;
    const data = req.body;

    const _id = new ObjectID(userId);
    const response = await userCollection.findOneAndUpdate(
      { _id },
      { $set: data },
      {
        returnOriginal: false,
      }
    );

    if (response.ok !== 1) {
      return res.status(400).json({ error: "Impossible to update the user" });
    }
    res.json(response.value);
  });

  // Supprimer un utilisateur
  app.delete("/users/:userId", async (req, res) => {
    const { userId } = req.params;
    const _id = new ObjectID(userId);
    const response = await userCollection.findOneAndDelete({ _id });
    if (response.value === null) {
      return res.status(404).send({ error: "impossible to remove this user" });
    }

    res.status(204).send();
  });

  //ajouter une adresse
  app.post("/users/:userId/addresses", async (req, res) => {
    const { userId } = req.params;
    const { street, number, city } = req.body;
    const _id = new ObjectID(userId);

    const { value } = await userCollection.findOneAndUpdate(
      {
        _id,
      },
      {
        $push: {
          addresses: {
            street,
            number,
            city,
            _id: new ObjectID(),
          },
        },
      },
      {
        returnOriginal: false,
      }
    );

    res.json(value);
  });

  // Supprimer une adresse
  app.delete("/users/:userId/addresses/:addressId", async (req, res) => {
    const { userId, addressId } = req.params;
    const _id = new ObjectID(userId);
    const _addressId = new ObjectID(addressId);

    const { value } = await userCollection.findOneAndUpdate(
      {
        _id,
      },
      {
        $pull: { addresses: { _id: _addressId } },
      },
      {
        returnOriginal: false,
      }
    );

    res.json(value);
  });


  // Modifier une adresse
  app.post("/users/:userId/addresses/:addressId", async (req, res) => {
    const { userId, addressId } = req.params;
    const { street, number, city } = req.body;
    const _id = new ObjectID(userId);
    const _addressId = new ObjectID(addressId);

    const { value } = await userCollection.findOneAndUpdate(
      {
        _id,
        'addresses._id': _addressId
      },
      {
        $set: { 
          'addresses.$.street' : street,
          'addresses.$.number' : number,
          'addresses.$.city' : city,
         },
      },
      {
        returnOriginal: false,
      }
    );

    res.json(value);
  });


  // Récuperation de toutes les adresses
  app.get("/users/:userId/addresses", async (req, res) => {
    const { userId } = req.params;

    const addresses = await userCollection.aggregate([
        { $match: {_id: new ObjectID(userId) }},
        { $unwind: '$addresses' },
        { $project: {addresses: 1, _id: 0}},
        { $addFields: {
          city: '$addresses.city',
          street: '$addresses.street',
          number: '$addresses.number',
          _id: '$addresses._id',
        }},
        { $project: {city: 1, street: 1, number: 1}},
      // { $replaceRoot: { newRoot: '$addresses' }} 
    ]).toArray();

    res.json(addresses);
  });




  // Récuperation de toutes les adresses
  app.get("/users/:userId/addresses1", async (req, res) => {
    const { userId } = req.params;

    const addresses = await userCollection.aggregate([
        { $match: {_id: new ObjectID(userId) }},
        { $unwind: '$addresses' },
        { $project: {addresses: 1, _id: 0}},
        /*{ $addFields: {
          city: '$addresses.city',
          street: '$addresses.street',
          number: '$addresses.number',
          _id: '$addresses._id',
        }},
        { $project: {city: 1, street: 1, number: 1}},
      // { $replaceRoot: { newRoot: '$addresses' }} */
    ]).toArray();

    res.json(addresses);
  });

};

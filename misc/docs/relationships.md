# Relationships support design

#### Example : A user can have many addresses - an address only belongs to a single user

```javascript
class UsersResource extends Restypie.Resource {
  schema = {
    id: { type: 'int', isPrimaryKey: true, isFilterable: true },
    firstName: { type: String, isFilterable: true },
    age: { type: 'int', isFilterable: true },
    // Let's become fancy
    addresses: {
      type: Fields.ToManyField,
      isFilterable: true,
      to: addressesResource,
      toKey: 'user'
    }
  }
}

class AddressesResource extends Restypie.Resource {
  schema = {
    id: { type: 'int', isPrimaryKey: true, isFilterable: true },
    user: {
      type: Fields.ToOneField,
      isFilterable: true,
      to: usersResource
      // Since toKey is omitted, it defaults to usersResource.primaryKey
    },
    value: { type: String, isReadable: true }
  }
}
```

###### Fetch user with all his addresses

```
GET /v1/users/1?populate=addresses

{
  id: 1,
  firstName: 'John',
  age: 29,
  addresses: [{
    id: 1,
    user: 1,
    value: '333 Kearny St'
  }, {
    id: 2,
    user: 1,
    value: '2206 Greenwich St'
  }]
}
```

###### Fetch address with its corresponding user

```
GET /v1/addresses/1?populate=user

{
  id: 1,
  user: {
    id: 1,
    firstName: 'John',
    age: 29
  },
  value: '333 Kearny St'
}
```


#### Example : A user has only one SSN - An SSN can belong to ony one user

```javascript
class UsersResource extends Restypie.Resource {
  schema = {
    id: { type: 'int', isPrimaryKey: true, isFilterable: true },
    firstName: { type: String, isFilterable: true },
    age: { type: 'int', isFilterable: true },
    ssn: {
      type: Fields.ToOneField,
      to: ssnResource,
      toKey: 'value', //
      isFilterable: true,
    }
  }
}

class SSNResource extends Restypie.Resource {
  schema = {
    id: { type: 'int', isPrimaryKey: true, isFilterable: true },
    value: { type: 'int', isFilterable: true },
    user: {
      type: Fields.ToOneField,
      isFilterable: true,
      to: usersResource,
      // toKey is omitted, so it defaults to usersResource.primaryKey
    }
  }
}
```

###### Fetch a particular user and include his SSN details

```
GET /v1/users/1?populate=ssn

{
  id: 1,
  firstName: 'John',
  age: 29,
  ssn: {
    id: 1,
    value: 234456576,
    user: 1
  }
}
```

###### Fetch a particular ssn and include its corresponding user

```
GET /v1/ssn/1?populate=user

{
  id: 1,
  value: 234456576,
  user: {
    id: 1,
    firstName: 'John',
    age: 29
  }
}
```

#### Example : A movie can belong to many genres - A genre can have many movies


```javascript
class GenresResource extends Restypie.Resource {
  schema: {
    id: { type: 'int', isPrimaryKey: true, isFilterable: true },
    name: { type: String, isFilterable: true }
  }
}

// --- Restypie is unable to guess the lookup table, so it has to be declared as a resource ---
// TODO ensure that resources with combined primary keys can't use 'through' relations
class MovieGenresResource extends Restypie.Resource {
  schema: {
    genre: {
      type: 'int',
      isFilterable: true,
      isPrimaryKey: true // Combined primary key
    },
    movie: {
      type: 'int',
      isFilterable: true,
      isPrimaryKey: true // Combined primary key
    }
  }
}

class MoviesResource extends Restypie.Resource {
  schema: {
    id: { type: 'int', isPrimaryKey: true, isFilterable: true },
    title: { type: String, isFilterable: true },
    // Let's get fancy
    genres: {
      type: Fields.ToManyField,
      to: genresResource,
      toKey: 'id', // Defaults to to.primaryKey is omitted
      through: movieGenresResource,
      throughKey: 'movie', // Mandatory
      otherThroughKey: 'genre', // Mandatory
      isFilterable: true
    }
  }
}
```


** Required queries to get the result **

```
GET /v1/movie-genres?movie=1&select=genre // Only what we need
GET /v1/genres?id__in={distinct `genre` from previous query}
```

###### Fetch a particular movie and populate the genres

```
GET /v1/movies/1?populate=genres

{
  id: 1,
  title: 'a movie',
  genres: [{
    id: 1,
    name: 'action'
  }, {
    id: 2,
    name: 'another genre'
  }]
}
```
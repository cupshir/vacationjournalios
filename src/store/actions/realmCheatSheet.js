// Cheat Sheet, not meant to referenced directly

// manually register account
Realm.Sync.User.register(AUTH_URL, username, password);




// Seed parks from API
realm.write(() => {
response.body.data.forEach(park => {
    realm.create('Park', {
        id: uuid.v4(),
        name: park.parkname,
        dateCreated: Date(),
        dateModified: Date()
    },
    true
    );
})
})

// Park ID conversion
//Disneyland
1 = '818f87d9-368b-4f2b-8a74-d91c1f0462cb';
//California Adventure
2 = '7a98140f-3930-4f05-b1e6-caaf9df6124f';
// Magic Kingdom
3 = '52d9a73b-cf1f-478e-8b0f-12b86d7274bd';
// Epcot
4 = 'c4d08ff1-0308-4831-8e78-f91d453f34a1';
// Disney Hollywood Studios
5 = '797cbbf6-a5ea-43bd-86ff-083eb904530b';
// Disneys Animal Kingdom
6 = 'c29ad7c1-08f6-4a88-96ee-f44d0747241c';


// Seed attractions from API
request
.get(`${API_URL}/attractionswithpark`)
.then(response => {

  realm.write(() => {
    response.body.data.forEach(attraction => {
      let newParkId;

      switch( attraction.parkid ) {
        case 1: {
          newParkId = '818f87d9-368b-4f2b-8a74-d91c1f0462cb';
          break;
        }
        case 2: {
          newParkId = '7a98140f-3930-4f05-b1e6-caaf9df6124f';
          break;
        }
        case 3: {
          newParkId = '52d9a73b-cf1f-478e-8b0f-12b86d7274bd';
          break;
        }
        case 4: {
          newParkId = 'c4d08ff1-0308-4831-8e78-f91d453f34a1';
          break;
        }
        case 5: {
          newParkId = '797cbbf6-a5ea-43bd-86ff-083eb904530b';
          break;
        }
        case 6: {
          newParkId = 'c29ad7c1-08f6-4a88-96ee-f44d0747241c';
          break;
        }
        default:
          return;              
      }

      const park = realm.objectForPrimaryKey('Park', newParkId);

       if (park) {
        park.attractions.push(realm.create('Attraction', {
              id: uuid.v4(),
              name: attraction.attractionname,
              park: { id: newParkId },
              description: attraction.attractiondescription,
              heightToRide: 0,
              hasScore: attraction.attractionhasscore,
              dateCreated: new Date(),
              dateModified: new Date()
          },
          true
        ));
       }
    })
})
})


// Change realm to public
const condition = { userId: '*' };

user.applyPermissions(condition, fullRealmURL, 'read');




// Request parks from API
request
.get(`${API_URL}/parks`)
.then(response => {
    // do something
})
.catch(error => {
    console.log(error);
})




// Copy Realm
export function realmUtility() {

    const fullRealmURL = `${REALM_URL}/${REALM_PARKS_PATH}`;
  
    const realm_server = REALM_URL;
    const username = '';
    const password = '';
    const source_realm_path = `${REALM_URL}/path`;
    const target_realm_path = `${REALM_URL}/path`;
  
  
    Realm.Sync.User.login(AUTH_URL, username, password).then(user => {
      copyRealm(user, source_realm_path, target_realm_path);
      console.log("done");
    }).catch(error => {
      console.log('Login Failed: ', error);
    });
  }
  
  function copyObject(obj, objSchema, targetRealm) {
    const copy = {};
    for (var key in objSchema.properties) {
      const prop = objSchema.properties[key];
      if (!prop.hasOwnProperty('objectType')) {
        copy[key] = obj[key];
      }
      else if (prop['type'] == "list") {
        copy[key] = [];
      }
      else {
        copy[key] = null;
      }
    }
  
    // Add object to target realm
    targetRealm.create(objSchema.name, copy);
  }
  
  function getMatchingObjectInOtherRealm(sourceObj, source_realm, target_realm, class_name) {
    const allObjects = source_realm.objects(class_name);
    const ndx = allObjects.indexOf(sourceObj);
  
    // Get object on same position in target realm
    return target_realm.objects(class_name)[ndx];
  }
  
  function addLinksToObject(sourceObj, targetObj, objSchema, source_realm, target_realm) {
    for (var key in objSchema.properties) {
      const prop = objSchema.properties[key];
      if (prop.hasOwnProperty('objectType')) {
        if (prop['type'] == "list") {
          var targetList = targetObj[key];
          sourceObj[key].forEach((linkedObj) => {
            const obj = getMatchingObjectInOtherRealm(linkedObj, source_realm, target_realm, prop.objectType);
            targetList.push(obj);
          });
        }
        else {
          // Find the position of the linked object
          const linkedObj = sourceObj[key];
          if (linkedObj === null) {
            continue;
          }
  
          // set link to object on same position in target realm
          targetObj[key] = getMatchingObjectInOtherRealm(linkedObj, source_realm, target_realm, prop.objectType);
        }
      }
    }
  }
  
  function copyRealm(user, source_realm_url, target_realm_url) {
    // open source realm
    const source_realm = new Realm({
      sync: {
        user: user,
        url: source_realm_url,
      }
    });
    const source_realm_schema = source_realm.schema;
  
    const target_realm = new Realm({
      sync: {
        user: user,
        url: target_realm_url,
      },
      schema: source_realm_schema
    });
  
    target_realm.write(() => {
      // Copy all objects, but ignore links for now
      source_realm_schema.forEach((objSchema) => {
        console.log('Copying objects: ', objSchema['name']);
        const allObjects = source_realm.objects(objSchema['name']);
  
        allObjects.forEach((obj) => {
          copyObject(obj, objSchema, target_realm)
        });
      });
  
      // Do a second pass to add links
      source_realm_schema.forEach((objSchema) => {
        console.log('Updating links in: ', objSchema['name']);
        const allSourceObjects = source_realm.objects(objSchema['name']);
        const allTargetObjects = target_realm.objects(objSchema['name']);
  
        for (var i = 0; i < allSourceObjects.length; ++i) {
          const sourceObject = allSourceObjects[i];
          const targetObject = allTargetObjects[i];
  
          addLinksToObject(sourceObject, targetObject, objSchema, source_realm, target_realm);
        }
      });
    });
  }


  // create user with express API

  // Send API request to create user
  request
  .post(`${API_URL}/user/create`)
  .send({
    email: credentials.email,
    password: credentials.password,
    firstname: credentials.firstname,
    lastname: credentials.lastname
  })
  .then(response => {
    // Check if response status is failed and return message if so
    if(response.body.status === 'failed') {
      return dispatch(authenticationError(response.body));
    }
          
     dispatch(authenticateUserFromRealm(userObject, true));

  })
  .catch(error => {
    dispatch(authenticationError(error));
  });









  // Archive

  // Get Journal by Id and set as activeJournal
export function getJournalAndSetAsActiveJournal(realmUser, journalId) {
  return (dispatch) => {
    if (realmUser && journalId) {
      // load user object and journal object
      const journal = realm.objectForPrimaryKey('Journal', journalId);
      if (journal && user) {
        // write journal object to activeJournal of user object
        realm.write(() => {
          user.activeJournal = journal;
        });
        // send updated user object to redux store
        dispatch({
          type: JOURNAL_LOAD_SUCCESS,
          activeJournal: user.activeJournal
        });
      } else {
        // Action failed
        dispatch({
          type: JOURNAL_ACTION_FAILED,
          error: 'Failed to load journal'
        });
      }
    } else {
      // Missing userId or Journal id
      dispatch({
        type: JOURNAL_ACTION_FAILED,
        error: 'UserId and/or JournalId missing. Unable to get journal'
      });
    }
  }
}






// Local Storage functions

// Save item to local storage
const _saveItem = async (key, value) => {
  try {
    await AsyncStorage.setItem(key, value);
  } catch (error) {
    throw error;
  }
};

// Get item from local storage
const _getItem = async (key) => {
  try {
    return await AsyncStorage.getItem(key);
  } catch (error) {
    throw error;
  }
};

// Remove item from local storage
const _removeItem = async (key) => {
  try {
    return await AsyncStorage.removeItem(key);
  } catch (error) {
    throw error;
  }
};

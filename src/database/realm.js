'use strict';

import Realm from 'realm';

class User extends Realm.Object {}
User.schema = {
    name: 'User',
    primaryKey: 'id',
    properties: {
        id: { type: 'int', indexed: true },
        firstName: 'string',
        lastName: 'string',
        email: 'string',
        activeJournal: { type: 'Journal' },
        journals: { type: 'list', objectType: 'Journal' },
        jwtToken: 'string'
    }
}

class Park extends Realm.Object {}
Park.schema = {
    name: 'Park',
    primaryKey: 'id',
    properties: {
        id: { type: 'int', indexed: true },
        name: 'string'
    }
}

class Attraction extends Realm.Object {}
Attraction.schema = {
    name: 'Attraction',
    primaryKey: 'id',
    properties: {
        id: { type: 'int', indexed: true },
        name: 'string',
        park: { type: 'Park' },
        description: 'string',
        heightToRide: 'int',
        hasScore: 'bool',
    }
}

class Journal extends Realm.Object {}
Journal.schema = {
    name: 'Journal',
    primaryKey: 'id',
    properties: {
        id: { type: 'string', indexed: true },
        name: 'string',
        journalEntries: { type: 'list', objectType: 'JournalEntry' },
        dateCreated: 'date',
        dateModified: 'date'
    }
}

class JournalEntry extends Realm.Object {}
JournalEntry.schema = {
    name: 'JournalEntry',
    primaryKey: 'id',
    properties: {
        id: { type: 'string', indexed: true },
        park: { type: 'Park' },
        attraction: { type: 'Attraction' },
        dateJournaled: 'date',
        dateCreated: 'date',
        dateModified: 'date',
        minutesWaited: 'int',
        rating: 'int',
        pointsScored: 'int',
        usedFastPass: 'bool',
        comments: 'string'
    }
}

export default new Realm({schema: [User, Park, Attraction, Journal, JournalEntry]});
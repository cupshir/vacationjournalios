'use strict';

import Realm from 'realm';

// Realm Model for userRealm

// Person Model
export class Person extends Realm.Object {}
Person.schema = {
    name: 'Person',
    primaryKey: 'id',
    properties: {
        id: { type: 'string', indexed: true },
        email: { type: 'string' },
        firstName: 'string',
        lastName: 'string',
        profilePhoto: 'string?',
        savePhotosToCameraRoll: {type:'bool', default: false},
        activeJournal: { type: 'Journal' },
        journals: { type: 'list', objectType: 'Journal' },
        dateCreated: 'date',
        dateModified: 'date',
        parksLastSynced: 'date',
        attractionsLastSynced: 'date'
    }
}

// Park Model
export class Park extends Realm.Object {}
Park.schema = {
    name: 'Park',
    primaryKey: 'id',
    properties: {
        id: { type: 'string', indexed: true },
        name: { type: 'string' },
        photo: 'string?',
        dateCreated: 'date',
        dateModified: 'date',
        dateSynced: 'date',
        description: 'string?'
    }
}

// Attraction Model
export class Attraction extends Realm.Object {}
Attraction.schema = {
    name: 'Attraction',
    primaryKey: 'id',
    properties: {
        id: { type: 'string', indexed: true },
        name: { type: 'string' },
        photo: 'string?',
        park: { type: 'Park' },
        description: 'string',
        heightToRide: 'int',
        hasScore: 'bool',
        dateCreated: 'date',
        dateModified: 'date',
        dateSynced: 'date'
    }
}

// Journal Model
export class Journal extends Realm.Object {}
Journal.schema = {
    name: 'Journal',
    primaryKey: 'id',
    properties: {
        id: { type: 'string', indexed: true },
        name: 'string',
        photo: 'string?',
        startDate: 'date?',
        endDate: 'date?',
        owner: 'string',
        journalEntries: { type: 'list', objectType: 'JournalEntry' },
        parks: { type: 'list', objectType: 'Park'},
        dateCreated: 'date',
        dateModified: 'date'
    }
}

// JournalEntry Model
export class JournalEntry extends Realm.Object {}
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
        photo: 'string?',
        minutesWaited: 'int',
        rating: 'int',
        pointsScored: 'int?',
        usedFastPass: 'bool',
        comments: 'string?',
        owner: 'string'
    }
}

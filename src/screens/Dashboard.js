import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
    View,
    StyleSheet
} from 'react-native';

// temp for dev
import * as parkActions from '../store/actions/parkActions';
import * as attractionActions from '../store/actions/attractionActions';

import StatBoxLarge from '../components/StatBoxLarge'
import StatBoxSmall from '../components/StatBoxSmall'

class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
  }
  
  onNavigatorEvent(event) {
  }

  componentDidMount() {
    // TODO: Update to load from realm, but leave for populating realm (until better way is finished)
    this.props.dispatch(parkActions.requestParks());
    this.props.dispatch(attractionActions.requestAttractions());
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.upper}>
          <StatBoxLarge style={styles.largeBox} title="Most Ridden Today" journalEntry="Journal Entry Object" />
          <StatBoxLarge style={styles.largeBox} title="Most Ridden Today" journalEntry="Journal Entry Object" />
          <StatBoxLarge style={styles.largeBox} title="Most Ridden Today" journalEntry="Journal Entry Object" />
        </View>
        <View style={styles.lower}>
          <StatBoxSmall style={styles.largeBox} title="Most Ridden Today" journalEntry="Journal Entry Object" />
          <StatBoxSmall style={styles.largeBox} title="Most Ridden Today" journalEntry="Journal Entry Object" />
          <StatBoxSmall style={styles.largeBox} title="Most Ridden Today" journalEntry="Journal Entry Object" />
          <StatBoxSmall style={styles.largeBox} title="Most Ridden Today" journalEntry="Journal Entry Object" />
          <StatBoxSmall style={styles.largeBox} title="Most Ridden Today" journalEntry="Journal Entry Object" />
          <StatBoxSmall style={styles.largeBox} title="Most Ridden Today" journalEntry="Journal Entry Object" />
        </View>
      </View>
    );
  }
}

var styles = StyleSheet.create({
  container: {
    flex: 1
  },
  upper: {
    marginTop: 5
  },
  lower: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginLeft: 5,
    marginRight: 5
  }
})

export default connect()(Dashboard);

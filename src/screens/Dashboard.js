import React, { Component } from 'react';
import {
    View,
    StatusBar,
    StyleSheet
} from 'react-native';

import * as UserService from '../realm/userService';

import StatBoxLarge from '../components/StatBoxLarge';
import StatBoxSmall from '../components/StatBoxSmall';

class Dashboard extends Component {
    constructor(props) {
        super(props);
        this.state = { 
            currentUser: null,
            stats: {
                mostRiddenToday: '',
                mostRiddenWeek: '',
                mostRiddenLife: '',
                minutesWaitedToday: '0',
                minutesWaitedWeek: '0',
                minutesWaitedLife: '0'
            },
            isLoading: true
        };
        this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
    }
  
    onNavigatorEvent(event) {
        if (event.id === 'willAppear') {
            this.updateUserStatsInState(UserService.currentUser);
        }
    }
    // update current user in state, if no current user clear user object from state
    updateUserStatsInState = (user) => {
        if (user) {
            this.setState({
                ...this.state,
                currentUser: user,
                stats: {
                    mostRiddenToday: '',
                    mostRiddenWeek: '',
                    mostRiddenLife: '',
                    minutesWaitedToday: UserService.totalMinutesWaitedToday(),
                    minutesWaitedWeek: UserService.totalMinutesWaitedWeek(),
                    minutesWaitedLife: UserService.totalMinutesWaitedLife()
                },
                isLoading: false
            });            
        } else {
            this.setState({
                ...this.state,
                currentUser: null,
                stats: {
                    mostRiddenToday: '',
                    mostRiddenWeek: '',
                    mostRiddenLife: '',
                    minutesWaitedToday: '0',
                    minutesWaitedWeek: '0',
                    minutesWaitedLife: '0'
                },
                isLoading: false
            });
        }
    }

  render() {
    return (
      <View style={styles.container}>
        <StatusBar
            barStyle="light-content"
        />
        <View style={styles.upper}>
            <StatBoxLarge style={styles.largeBox} title="Most Ridden Today" journalEntry="Journal Entry Object" />
            <StatBoxLarge style={styles.largeBox} title="Most Ridden This Week" journalEntry="Journal Entry Object" />
            <StatBoxLarge style={styles.largeBox} title="Most Ridden Life Time" journalEntry="Journal Entry Object" />
        </View>
        <View style={styles.lower}>
            <StatBoxSmall style={styles.largeBox} title="Minutes Waited Today" stat={this.state.stats.minutesWaitedToday ? this.state.stats.minutesWaitedToday : '0'} />
            <StatBoxSmall style={styles.largeBox} title="Minutes Waited This Week" stat={this.state.stats.minutesWaitedWeek ? this.state.stats.minutesWaitedWeek : '0'} />
            <StatBoxSmall style={styles.largeBox} title="Minutes Waited Life Time" stat={this.state.stats.minutesWaitedLife ? this.state.stats.minutesWaitedLife : '0'} />
            <StatBoxSmall style={styles.largeBox} title="Something" stat="XXXX" />
            <StatBoxSmall style={styles.largeBox} title="Something" stat="XXX" />
            <StatBoxSmall style={styles.largeBox} title="Something" stat="X" />
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

export default Dashboard;

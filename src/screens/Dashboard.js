import React, { Component } from 'react';
import {
    ImageBackground,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import * as UserService from '../realm/userService';

import LoadingMickey from '../components/LoadingMickey';
import MickeyButton from '../components/MickeyButton';

import StatBoxLarge from '../components/StatBoxLarge';
import StatBoxSmall from '../components/StatBoxSmall';

class Dashboard extends Component {
    constructor(props) {
        super(props);
        this.state = { 
            currentUser: null,
            stats: {
                minutesWaited: {
                    today: '0',
                    vacation: '0',
                    life: '0'
                },
                usedFastpasses: {
                    today: '0',
                    vacation: '0',
                    life: '0'
                },
                totalRides: {
                    today: '0',
                    vacation: '0',
                    life: '0'
                },
                mostRidden: {
                    today: '0',
                    vacation: '0',
                    life: '0'
                },
                mostVisitedPark: {
                    vacation: '0',
                    life: '0'
                }
            },
            displayStats: {
                minutesWaited: {
                    label: 'Today',
                    value: '0'
                }, 
                usedFastpasses: {
                    label: 'Today',
                    value: '0'
                }, 
                totalRides: {
                    label: 'Today',
                    value: '0'
                },
                mostRidden: {
                    label: 'Today',
                    attraction: ''
                },
                mostVisitedPark: {
                    label: 'Vacation',
                    park: ''
                }
            },
            isAuthenticated: false,
            statsLoaded: false,
            isLoading: false
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
                    minutesWaited: {
                        today: UserService.totalMinutesWaitedToday(),
                        vacation: UserService.totalMinutesWaitedVacation(),
                        life: UserService.totalMinutesWaitedLife()
                    },
                    usedFastpasses: {
                        today: UserService.totalFastpassesUsedToday(),
                        vacation: UserService.totalFastpassesUsedVacation(),
                        life: UserService.totalFastpassesUsedLife()
                    },
                    totalRides: {
                        today: UserService.totalRidesToday(),
                        vacation: UserService.totalRidesVacation(),
                        life: UserService.totalRidesLife()
                    },
                    mostRidden: {
                        today: UserService.mostRiddenToday(),
                        vacation: UserService.mostRiddenVacation(),
                        life: UserService.mostRiddenLife()
                    },
                    mostVisitedPark: {
                        vacation: '0',
                        life: '0'
                    }
                },
                displayStats: {
                    minutesWaited: {
                        label: 'Today',
                        value: UserService.totalMinutesWaitedToday()
                    }, 
                    usedFastpasses: {
                        label: 'Today',
                        value: UserService.totalFastpassesUsedToday()
                    }, 
                    totalRides: {
                        label: 'Today',
                        value: UserService.totalRidesToday()
                    },
                    mostRidden: {
                        label: 'Today',
                        attraction: UserService.mostRiddenToday()
                    },
                    mostVisitedPark: {
                        label: 'Vacation',
                        park: ''
                    }
                },
                isAuthenticated: true,
                statsLoaded: true,
                isLoading: false
            });            
        } else {
            this.setState({
                ...this.state,
                currentUser: null,
                stats: {
                    minutesWaited: {
                        today: '',
                        vacation: '',
                        life: ''
                    },
                    usedFastpasses: {
                        today: '0',
                        vacation: '0',
                        life: '0'
                    },
                    totalRides: {
                        today: '0',
                        vacation: '0',
                        life: '0'
                    },
                    mostRidden: {
                        today: '0',
                        vacation: '0',
                        life: '0'
                    },
                    mostVisitedPark: {
                        vacation: '0',
                        life: '0'
                    }
                },
                displayStats: {
                    minutesWaited: {
                        label: 'Today',
                        value: '0'
                    }, 
                    usedFastpasses: {
                        label: 'Today',
                        value: '0'
                    }, 
                    totalRides: {
                        label: 'Today',
                        value: '0'
                    },
                    mostRidden: {
                        label: 'Today',
                        attraction: ''
                    },
                    mostVisitedPark: {
                        label: 'Vacation',
                        attraction: ''
                    }
                },
                isAuthenticated: false,
                statsLoaded: false,
                isLoading: false
            });
        }
    }

    // handle minutes waited change
    handleMinutesWaitedChange = () => {
        // get current value and cycle to next value otherwise default to today
        switch (this.state.displayStats.minutesWaited.label) {
            case 'Today': {
                this.setState({
                    ...this.state,
                    displayStats: {
                        ...this.state.displayStats,
                        minutesWaited: {
                            label: 'Vacation',
                            value: this.state.stats.minutesWaited.vacation
                        }
                    }
                });
                break;
            }
            case 'Vacation': {
                this.setState({
                    ...this.state,
                    displayStats: {
                        ...this.state.displayStats,
                        minutesWaited: {
                            label: 'Life Time',
                            value: this.state.stats.minutesWaited.life
                        }
                    }
                });
                break;
            }
            default: {
                this.setState({
                    ...this.state,
                    displayStats: {
                        ...this.state.displayStats,
                        minutesWaited: {
                            label: 'Today',
                            value: this.state.stats.minutesWaited.today
                        }
                    }
                });
                break
            }
        }
    }

    // handle minutes waited change
    handleTotalFastpassesChange = () => {
        // get current value and cycle to next value otherwise default to today
        switch (this.state.displayStats.usedFastpasses.label) {
            case 'Today': {
                this.setState({
                    ...this.state,
                    displayStats: {
                        ...this.state.displayStats,
                        usedFastpasses: {
                            label: 'Vacation',
                            value: this.state.stats.usedFastpasses.vacation
                        }
                    }
                });
                break;
            }
            case 'Vacation': {
                this.setState({
                    ...this.state,
                    displayStats: {
                        ...this.state.displayStats,
                        usedFastpasses: {
                            label: 'Life Time',
                            value: this.state.stats.usedFastpasses.life
                        }
                    }
                });
                break;
            }
            default: {
                this.setState({
                    ...this.state,
                    displayStats: {
                        ...this.state.displayStats,
                        usedFastpasses: {
                            label: 'Today',
                            value: this.state.stats.usedFastpasses.today
                        }
                    }
                });
                break
            }
        }
    }


    // handle minutes waited change
    handleTotalRidesChange = () => {
        // get current value and cycle to next value otherwise default to today
        switch (this.state.displayStats.totalRides.label) {
            case 'Today': {
                this.setState({
                    ...this.state,
                    displayStats: {
                        ...this.state.displayStats,
                        totalRides: {
                            label: 'Vacation',
                            value: this.state.stats.totalRides.vacation
                        }
                    }
                });
                break;
            }
            case 'Vacation': {
                this.setState({
                    ...this.state,
                    displayStats: {
                        ...this.state.displayStats,
                        totalRides: {
                            label: 'Life Time',
                            value: this.state.stats.totalRides.life
                        }
                    }
                });
                break;
            }
            default: {
                this.setState({
                    ...this.state,
                    displayStats: {
                        ...this.state.displayStats,
                        totalRides: {
                            label: 'Today',
                            value: this.state.stats.totalRides.today
                        }
                    }
                });
                break
            }
        }
    }

    // handle most ridden change
    handleMostRiddenChange = () => {
        // get current value and cycle to next value otherwise default to today
        switch (this.state.displayStats.mostRidden.label) {
            case 'Today': {
                this.setState({
                    ...this.state,
                    displayStats: {
                        ...this.state.displayStats,
                        mostRidden: {
                            label: 'Vacation',
                            attraction: this.state.stats.mostRidden.vacation
                        }
                    }
                });
                break;
            }
            case 'Vacation': {
                this.setState({
                    ...this.state,
                    displayStats: {
                        ...this.state.displayStats,
                        mostRidden: {
                            label: 'Life Time',
                            attraction: this.state.stats.mostRidden.life
                        }
                    }
                });
                break;
            }
            default: {
                this.setState({
                    ...this.state,
                    displayStats: {
                        ...this.state.displayStats,
                        mostRidden: {
                            label: 'Today',
                            attraction: this.state.stats.mostRidden.today
                        }
                    }
                });
                break
            }
        }
    }

    // handle most visited park change
    handleMostVisitedParkChange = () => {
        // get current value and cycle to next value otherwise default to today
        switch (this.state.displayStats.mostVisitedPark.label) {
            case 'Vacation': {
                this.setState({
                    ...this.state,
                    displayStats: {
                        ...this.state.displayStats,
                        mostVisitedPark: {
                            label: 'Life Time',
                            park: this.state.stats.mostVisitedPark.life
                        }
                    }
                });
                break;
            }
            default: {
                this.setState({
                    ...this.state,
                    displayStats: {
                        ...this.state.displayStats,
                        mostVisitedPark: {
                            label: 'Vacation',
                            park: this.state.stats.mostVisitedPark.vacation
                        }
                    }
                });
                break
            }
        }
    }

    // lauch sign in modal
    onSignInPress = () => {
        this.props.navigator.showModal({
            screen: 'vacationjournalios.SignIn',
            title: 'Sign In',
            navigatorStyle: {
                largeTitle: true,
                navBarBackgroundColor: '#252525',
                navBarTextColor: '#FFFFFF',
                navBarButtonColor: '#FFFFFF',
                statusBarTextColorScheme: 'light',
                screenBackgroundColor: '#151515'
            },
            animated: true
        });
    }

    // launch register modal
    onRegisterPress = () => {
        this.props.navigator.showModal({
            screen: 'vacationjournalios.Register',
            title: 'Register',
            navigatorStyle: {
                largeTitle: true,
                navBarBackgroundColor: '#252525',
                navBarTextColor: '#FFFFFF',
                navBarButtonColor: '#FFFFFF',
                statusBarTextColorScheme: 'light',
                screenBackgroundColor: '#151515'
            },
            animated: true
        });
    }

    render() {
        if (this.state.isLoading) {
            return (
                <View style={styles.container}>
                    <LoadingMickey />
                </View>
            );
        }

        let mostRiddenAttraction = null;
        if(this.state.displayStats.mostRidden.attraction !== '') {
            mostRiddenAttraction = (
                <View style={styles.upper}>
                    <TouchableOpacity onPress={() => this.handleMostRiddenChange()}>
                        <StatBoxLarge style={styles.largeBox} title="Most Ridden" label={this.state.displayStats.mostRidden.label} value={this.state.displayStats.mostRidden.attraction} />
                    </TouchableOpacity>
                </View>
            );
        }

        let mostVisitedPark = null; 
        
        if(this.state.displayStats.mostVisitedPark.park !== '') {
            mostVisitedPark = (
                <View style={styles.upper}>
                    <TouchableOpacity onPress={() => this.handleMostVisitedParkChange()}>
                        <StatBoxLarge style={styles.largeBox} title="Most Visited" label={this.state.displayStats.mostVisitedPark.label} value={this.state.displayStats.mostVisitedPark.park} />
                    </TouchableOpacity>
                </View>
            );
        }

        if(this.state.isAuthenticated && this.state.statsLoaded) {
            return (
                <KeyboardAwareScrollView>
                    <View style={styles.container}>
                        <StatusBar barStyle="light-content" />
                        <View style={styles.lower}>
                            <TouchableOpacity onPress={() => this.handleMinutesWaitedChange()}>
                                <StatBoxSmall style={styles.largeBox} title="Minutes Waited" label={this.state.displayStats.minutesWaited.label} value={this.state.displayStats.minutesWaited.value} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => this.handleTotalFastpassesChange()}>
                                <StatBoxSmall style={styles.largeBox} title="Fastpasses Used" label={this.state.displayStats.usedFastpasses.label} value={this.state.displayStats.usedFastpasses.value} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => this.handleTotalRidesChange()}>
                                <StatBoxSmall style={styles.largeBox} title="Total Attractions" label={this.state.displayStats.totalRides.label} value={this.state.displayStats.totalRides.value} />
                            </TouchableOpacity>
                        </View>
                        {mostRiddenAttraction}
                        {mostVisitedPark}
                    </View>
                </KeyboardAwareScrollView>
            );
        }

        // Default render sign in and sign up buttons
        return (
            <View style={styles.signInContainer}>
                <StatusBar barStyle="light-content" />
                <ImageBackground 
                    style={styles.image} 
                    source={require('../assets/Mickey_Background.png')}
                    resizeMode='cover'
                    blurRadius={2}
                    opacity={10}>
                    <View style={styles.signInButtons}>
                        <MickeyButton text='Login' onPress={this.onSignInPress} />
                        <MickeyButton text='Register' onPress={this.onRegisterPress} />
                    </View>
                </ImageBackground>
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
    },
    image: {
        flex: 1,
    },
    signInContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    signInButtons: {
        flex: 1,
        paddingTop: 100
    },
    button: {
        backgroundColor: 'white',
        width: 100,
        height: 50,
        borderWidth: 1,
        borderRadius: 5,
        margin: 10
    }
});

export default Dashboard;

import React, { Component } from 'react';
import {
    View,
    StyleSheet,
    TextInput,
    Picker,
    Modal,
    TouchableHighlight,
    AlertIOS
} from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { 
    FormLabel, 
    FormInput,
    Rating,
    CheckBox,
    Text
} from 'react-native-elements';
import DatePicker from 'react-native-datepicker';

import * as journalActions from '../../store/actions/journalActions';

import LoadingMickey from '../../components/LoadingMickey';

class CreateJournalEntry extends Component {
    static navigatorButtons = {
        rightButtons: [
          {
              title: 'Save',
              id: 'save' // id for this button, given in onNavigatorEvent(event) to help understand which button was clicked
          }
        ]
    };

    constructor(props) {
        super(props);
        this.state = {
            formValues: {
                parkId: '',
                attractionId: '',
                journaledDate: new Date(),
                minutesWaited: '',
                fastpassUsed: false,
                rating: 0,
                points: '',
                comments: ''
            },
            formErrors: {
                parkId: '',
                attractionId: '',
                journaledDate: '',
                rating: '',
                minutesWaited: ''
            },
            parkModalVisible: false,
            attractionModalVisible: false,
            renderAttractions: false
        };
        this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
    }

    onNavigatorEvent(event) { // this is the onPress handler for the two buttons together
        if (event.type == 'NavBarButtonPress') { // this is the event type for button presses
            if (event.id == 'save') {
                this.handleSavePress();
            }
        }
    }

    setParkModalVisible(visible) {
        this.setState({
            ...this.state,
            parkModalVisible: visible
        });
    }

    setAttractionModalVisible(visible) {
        this.setState({
            ...this.state,
            attractionModalVisible: visible
        });
    }

    // handle minutes waited change
    handleMinutesWaitedChange = (value) => {
        this.setState({
            formValues: {
                ...this.state.formValues, 
                minutesWaited: value.replace(/[^0-9]/g, '')
            }
        });
    }

    // handle rating change
    handleRatingChange = (rating) => {
        this.setState({
            formValues: {
                ...this.state.formValues, 
                rating: parseInt(rating, 10)
            }
        });
    }

    // handle comments change
    handleCommentsChange = (value) => {
        this.setState({
            formValues: {
                ...this.state.formValues,
                comments: value
            }
        })
    }

    // handle fastpass change
    handleFastpassChange = () => {
        this.setState({
            formValues: {
                ...this.state.formValues,
                fastpassUsed: !this.state.formValues.fastpassUsed
            }
        })
    }

    // handle points change
    handlePointsChange = (value) => {
        this.setState({
            formValues: {
                ...this.state.formValues,
                points: value.replace(/[^0-9]/g, '')
            }
        })
    }

    // handle park change
    handleParkChange = (itemValue, itemIndex) => {
        this.setState({
            ...this.state,
            formValues: {
                ...this.state.formValues,
                parkId: itemValue,
                attractionId: ''
            },
            renderAttractions: true
        })
    }

    // handle attraction change
    handleAttractionChange = (itemValue, itemIndex) => {
        this.setState({
            formValues: {
                ...this.state.formValues,
                attractionId: itemValue
            }
        })
    }

    // handle date change
    handleJournaledDateChange = (date) => {
        this.setState({
            formValues: {
                ...this.state.formValues,
                journaledDate: date
            }
        })
    }

    // handle save press
    handleSavePress = () => {
        // Check if ready to submit
        const ready = this.readyForSubmit(this.state.formValues)

        if (ready) {
            AlertIOS.alert('ready to submit')
        } else {
            // TODO: better message
            AlertIOS.alert('not ready to submit')
        }
    }
    
    // Check if form is ready for submit and return true/false
    readyForSubmit = (values) => {
        let ready = true;

        // Check that required formValues have a value, if value missing return false
        if (values.parkId === '') {
            return false;
        }
        if (values.attractionId === '') {
            return false;
        }
        if (values.rating === 0) {
            return false;
        }
        if (values.journaledDate === '') {
            return false;
        }
        if (values.minutesWaited === '') {
            return false;
        }

        // If all required values present, Check that there are no formError messages
        if(ready) {
            ready = !this.checkForErrorMessages();
        }

        return ready;
    }

    // Check if error messages exist in state and return true/false
    checkForErrorMessages = () => {
        let errorCount = 0;
        Object.entries(this.state.formErrors).forEach(([key, val]) => {
            if (val || val !== '') {
                errorCount++;
            }
        });

        if (errorCount > 0) {
            return true;
        } else {
            return false;
        }
    }

    // Render Validation Error component
    renderError = (error) => {
        return (
            <FormValidationMessage>
                {error}
            </FormValidationMessage>            
        );
    }

      // Render attractions dropdown
    renderAttractionsPicker = () => {
        // Double Check for selected park and attractions data, return if one or other not found
        if(!this.state.formValues.parkId || !this.props.attractions.attractions){
            console.log('1st return');
            return;
        }

        // // Create new list of filtered attractions by selected park
        const parkAttractions = this.props.attractions.attractions.filter((park) => {
             return (park.parkid === parseInt(this.state.formValues.parkId, 10))
        })

        // Render Attractions field
        return (
            <View>
                <TouchableHighlight
                    onPress={() => { this.setAttractionModalVisible(true); }} >
                        <Text>{ this.state.formValues.attractionId !== '' ? this.state.formValues.attractionId : 'Select an Attraction'}</Text>
                </TouchableHighlight>

                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={this.state.attractionModalVisible}
                    onRequestClose={() => { AlertIOS.alert('modal closed'); }}>
                        <View style={styles.modalContainer}>
                            <TouchableHighlight
                                onPress={() => { this.setAttractionModalVisible(false); }} >
                                    <Text style={{ textAlign: 'right' }}>X</Text>
                            </TouchableHighlight>
                            <Picker
                                selectedValue={this.state.formValues.attractionId}
                                onValueChange={itemValue => this.handleAttractionChange(itemValue)} >
                                    {parkAttractions.map((i, index) => (
                                        <Picker.Item key={index} label={i.attractionname} value={i.attractionid} />
                                    ))}
                            </Picker>
                        </View>
                </Modal>
        </View>
        );
    }

    // render View
    render() {
        // Check if errors exist in state.formErrors
        const parkIdError = (this.state.formErrors.parkId !== '') ? this.renderError(this.state.formErrors.parkId) : null;
        const attractionIdError = (this.state.formErrors.attractionId !== '') ? this.renderError(this.state.formErrors.attractionId) : null;
        const journaledDateError = (this.state.formErrors.journaledDate !== '') ? this.renderError(this.state.formErrors.journaledDate) : null;
        const ratingError = (this.state.formErrors.rating !== '') ? this.renderError(this.state.formErrors.rating) : null;
        const minutesWaitedError = (this.state.formErrors.minutesWaited !== '') ? this.renderError(this.state.formErrors.minutesWaited) : null;

        let attractionPicker = null;
        if (this.state.renderAttractions) {
            attractionPicker = this.renderAttractionsPicker(); 
        }


        // Loading Mickey Graphic
        if (this.props.journal.status === 'saving') {
            return (
                <View style={styles.container}>
                    <LoadingMickey />
                </View>
            );
        }

        if (!this.props.parks.parks.length || !this.props.attractions.attractions.length) {
            return (
                <View style={styles.messageContainer}>
                    <Text>Parks and/or attractions data missing. Add better handling later...</Text>
                </View>
            )
        }

        return (
            <View style={styles.container}>
                <View style={styles.parkAttractionSelector}>
                    <TouchableHighlight
                        onPress={() => {
                            this.setParkModalVisible(true);
                        }}
                    >
                        <Text>{ this.state.formValues.parkId !== '' ? this.state.formValues.parkId : 'Select a Park'}</Text>
                    </TouchableHighlight>
                    {attractionPicker}
                </View>
                <View style={styles.userImage}>
                    <Text>User Image</Text>
                </View>
                <View style={styles.journaledDateMinutes}>
                    <TextInput
                        style={styles.minuteswaited}
                        onChangeText={this.handleMinutesWaitedChange}
                        placeholder='Minutes Waited'
                        value={this.state.formValues.minutesWaited}
                    />
                    <DatePicker
                        style={styles.datepicker}
                        date={this.state.formValues.journaledDate}
                        mode="datetime"
                        placeholder="Select Date"
                        format="MM-DD-YYYY, hh:mm a"
                        confirmBtnText="Ok"
                        cancelBtnText="Cancel"
                        onDateChange={this.handleJournaledDateChange}
                        showIcon={false}
                        customStyles={{
                            dateInput: {
                                borderRadius: 5
                            },
                            btnTextConfirm: {
                                color: '#387EF7'
                            }
                        }}
                    />
                </View>
                <View style={styles.fastpassRating}>
                    <Rating
                        type="star"
                        fractions={0}
                        imageSize={40}
                        onFinishRating={this.handleRatingChange}
                        style={{ paddingVertical: 10 }}
                        startingValue={this.state.formValues.rating}
                    />
                    <CheckBox
                        title='Fastpass'
                        checked={this.state.formValues.fastpassUsed}
                        onPress={this.handleFastpassChange}
                        containerStyle={styles.fastpass}
                    />
                </View>
                <View style={styles.pointsRow}>
                    <TextInput
                        style={styles.points}
                        onChangeText={this.handlePointsChange}
                        placeholder='Points'
                        value={this.state.formValues.points}
                    />
                </View>
                <View>
                    <TextInput
                        style={styles.comments}
                        onChangeText={this.handleCommentsChange}
                        placeholder='Comments...'
                        value={this.state.formValues.comments}
                        multiline={true}
                        numberOfLines={5}
                        maxLength={400}
                    />
                </View>

                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={this.state.parkModalVisible}
                    onRequestClose={() => { AlertIOS.alert('modal closed'); }}>
                        <View style={styles.modalContainer}>
                            <TouchableHighlight
                                onPress={() => { this.setParkModalVisible(false); }} >
                                    <Text style={{ textAlign: 'right' }}>X</Text>
                            </TouchableHighlight>
                            <Picker
                                selectedValue={this.state.formValues.parkId}
                                onValueChange={itemValue => this.handleParkChange(itemValue)} >
                                    {this.props.parks.parks.map((i, index) => (
                                        <Picker.Item key={index} label={i.parkname} value={i.parkid} />
                                    ))}
                            </Picker>
                        </View>
                </Modal>
            </View>
        )
    }
}

var styles = StyleSheet.create({
    messageContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end'
    },
    container: {
        flex: 1
    },
    parkAttractionSelector: {
        flexDirection: 'column',
        marginRight: 25,
        marginLeft: 25
    },
    userImage: {
        marginRight: 25,
        marginLeft: 25,
        borderWidth: 1,
        height: 150
    },
    journaledDateMinutes: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginRight: 25,
        marginLeft: 25,
        marginTop: 10
    },
    datepicker: {
        width: 160,
        borderRadius: 5
    },
    minuteswaited: {
        width: 145,
        borderWidth: .5,
        borderColor: '#aaa',
        borderRadius: 5,
        height: 40,
        fontSize: 18,
        textAlign: 'center'
    },
    fastpassRating: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginRight: 25,
        marginLeft: 25,
    },
    fastpass: {
        backgroundColor: '#ffffff',
        borderColor: 'transparent'
    },
    points: {
        marginRight: 25,
        marginLeft: 25,
        borderWidth: .5,
        borderColor: '#aaa',
        borderRadius: 5,
        height: 40,
        width: 145,
        fontSize: 18,
        textAlign: 'center'
    },
    comments: {
        marginRight: 25,
        marginLeft: 25,
        marginTop: 10,
        borderWidth: .5,
        borderColor: '#aaa',
        borderRadius: 5,
        height: 100
    }
});

function mapStateToProps(state) {
    return {
        parks: state.parks,
        attractions: state.attractions,
        journal: state.journal,
        user: state.user
    }
}

export default connect(mapStateToProps)(CreateJournalEntry);
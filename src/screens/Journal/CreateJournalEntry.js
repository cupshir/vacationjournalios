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
              id: 'save'
          }
        ]
    };

    constructor(props) {
        super(props);
        this.state = {
            selectedPark: {
                parkRawSelectedValue: '',
                parkId: '',
                parkName: '',
            },
            selectedAttraction: {
                attractionRawSelectedValue: '',
                attractionId: '',
                attractionName: '',
                attractionHasScore: false,
            },
            formValues: {
                parkId: '',
                attractionId: '',
                dateJournaled: new Date(),
                minutesWaited: '',
                usedFastPass: false,
                rating: 0,
                pointsScored: '',
                comments: ''
            },
            formErrors: {
                parkId: '',
                attractionId: '',
                dateJournaled: '',
                rating: '',
                minutesWaited: ''
            },
            parkModalVisible: false,
            attractionModalVisible: false,
            renderAttractions: false
        };
        this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
    }

    onNavigatorEvent(event) { 
        if (event.type == 'NavBarButtonPress') {
            if (event.id == 'save') {
                this.handleSavePress();
            }
        }
    }

    // set park modal visible
    setParkModalVisible(visible) {
        this.setState({
            ...this.state,
            parkModalVisible: visible
        });
    }

    // set attraction modal visible
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
    handleRatingChange = (value) => {
        this.setState({
            formValues: {
                ...this.state.formValues, 
                rating: parseInt(value, 10)
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
                usedFastPass: !this.state.formValues.usedFastPass
            }
        });
    }

    // handle points change
    handlePointsScoredChange = (value) => {
        this.setState({
            formValues: {
                ...this.state.formValues,
                pointsScored: value.replace(/[^0-9]/g, '')
            }
        });
    }

    // handle park change
    //  itemValue contains parkId^parkName
    //  raw value is saved for setting the correct item in the picker
    //  selectedAttraction is cleared out to reset attraction picker when park changes 
    //      (this forces attractions to reload for newly selected park)
    handleParkChange = (itemValue) => {
        const array = itemValue.split('^');
        this.setState({
            selectedPark: {
                parkRawSelectedValue: itemValue,
                parkId: array[0],
                parkName: array[1]
            },
            formValues: {
                ...this.state.formValues,
                parkId: parseInt(array[0], 10),
                attractionId: ''
            },
            selectedAttraction: {
                attractionRawSelectedValue: '',
                attractionId: '',
                attractionName: '',
                attractionHasScore: false
            },
            renderAttractions: true,
            parkModalVisible: false
        });
    }

    // handle attraction change
    // itemValue contains attractionId^attractionName^attractionHasScore
    //  raw value is saved for setting the correct item in the picker
    handleAttractionChange = (itemValue) => {
        const array = itemValue.split('^');
        this.setState({ 
            selectedAttraction: {
                attractionRawSelectedValue: itemValue,
                attractionId: array[0],
                attractionName: array[1],
                attractionHasScore: (array[2] == 'true')
            },
            formValues: {
                ...this.state.formValues,
                attractionId: parseInt(array[0],10)
            },
            attractionModalVisible: false
        });
    }

    // handle date change
    handleDateJournaledChange = (date) => {
        this.setState({
            formValues: {
                ...this.state.formValues,
                dateJournaled: date
            }
        })
    }

    // handle save press
    handleSavePress = () => {
        // Check if form is ready to submit
        const ready = this.readyForSubmit(this.state.formValues)

        if (ready) {
            // scrub values (changes strings to numbers, etc)
            const submitValues = this.prepareValuesForDB(this.state.formValues);
            // save journal entry to realm db
            this.props.dispatch(journalActions.createJournalEntry(this.props.journal.journal.id, submitValues));
        } else {
            // TODO: better message
            AlertIOS.alert('not ready to submit')
        }
    }

    // Format values as needed by database
    // IE Some values exist as strings in form for display purposes and need to be converted to numbers
    prepareValuesForDB = (values) => {
        // Create return object
        let returnValues = {
        parkId: '',
        attractionId: '',
        minutesWaited: '',
        pointsScored: '',
        rating: '',
        usedFastPass: '',
        dateJournaled: '',
        comments: ''
        };

        // If minutes waited is '' update to 0 else pass value
        returnValues.minutesWaited = (values.minutesWaited === '') ? 0 : parseInt(values.minutesWaited, 10); 

        // if pointsscored is '' update to -1 else pass value
        // -1 is used for attactions that dont keep score (realm db doesnt allow nulls)
        returnValues.pointsScored = (values.pointsScored === '') ? -1 : parseInt(values.pointsScored, 10);

        // add remaining fields (these are already formated correctly)
        returnValues.parkId = values.parkId;
        returnValues.attractionId = values.attractionId;
        returnValues.rating = values.rating;
        returnValues.usedFastPass = values.usedFastPass;
        returnValues.dateJournaled = values.dateJournaled;
        returnValues.comments = values.comments;

        return returnValues;
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
        if (values.dateJournaled === '') {
            return false;
        }
        if (values.minutesWaited === '') {
            return false;
        }

        // If all required values present, Check that there are no formError messages
        if(ready) {
            // check returns true if errors, so we flip its return (readyForSubmit would be false on errors)
            ready = !this.checkForErrorMessages();
        }

        return ready;
    }

    // Check if error messages exist in state and return true/false
    checkForErrorMessages = () => {
        // loop through form errors object and look for values
        let errorCount = 0;
        Object.entries(this.state.formErrors).forEach(([key, val]) => {
            if (val || val !== '') {
                // value found, increase error count
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

    // Render points scored input
    renderPointsScored = () => {
        return (
            <View style={styles.pointsRow}>
                <TextInput
                    style={styles.points}
                    onChangeText={this.handlePointsScoredChange}
                    placeholder='Points Scored'
                    value={this.state.formValues.pointsScored}
                />
            </View>
        )
    }

    // Render attractions picker
    renderAttractionsPicker = () => {
        // Double Check for selected park and attractions data, return if one or other not found
        if(!this.state.selectedPark.parkId || !this.props.attractions.attractions){ return; }

        // Create new list of filtered attractions by selected park
        const parkAttractions = this.props.attractions.attractions.filter((attraction) => {
            return (attraction.parkid === parseInt(this.state.selectedPark.parkId, 10))
        });

        // Render Attractions field
        return (
            <View>
                <TouchableHighlight
                    onPress={() => { this.setAttractionModalVisible(true); }} >
                        <Text style={styles.parkAttractionText}>
                            { this.state.selectedAttraction.attractionName !== '' ? this.state.selectedAttraction.attractionName : 'Select an Attraction'}
                        </Text>
                </TouchableHighlight>

                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={this.state.attractionModalVisible}>
                        <View style={styles.modalContainer}>
                            <View style={styles.modalPickerHeader}>
                                <TouchableHighlight 
                                    style={styles.modalCloseButton}
                                    onPress={() => { 
                                        if(this.state.selectedAttraction.attractionRawSelectedValue === '') {
                                            const firstAttraction = parkAttractions[0];
                                            this.handleAttractionChange(firstAttraction.attractionid + '^' + firstAttraction.attractionname + '^' + firstAttraction.attractionhasscore)
                                        } else {
                                            this.setAttractionModalVisible(false); 
                                        }
                                    }} >
                                        <Text style={styles.modalCloseButtonText}>Ok</Text>
                                </TouchableHighlight>
                            </View>
                                <View style={styles.modalPickerBody}>                        
                                <Picker
                                    selectedValue={this.state.selectedAttraction.attractionRawSelectedValue}
                                    onValueChange={itemValue => this.handleAttractionChange(itemValue)} >
                                        {parkAttractions.map((i, index) => (
                                            <Picker.Item key={index} label={i.attractionname} value={i.attractionid + '^' + i.attractionname + '^' + i.attractionhasscore} />
                                        ))}
                                </Picker>
                            </View>
                        </View>
                </Modal>
        </View>
        );
    }

    // render View
    render() {
        // Check if errors exist in state.formErrors
        // TODO: Update form with form errors, message or red colors or something
        const parkIdError = (this.state.formErrors.parkId !== '') ? this.renderError(this.state.formErrors.parkId) : null;
        const attractionIdError = (this.state.formErrors.attractionId !== '') ? this.renderError(this.state.formErrors.attractionId) : null;
        const dateJournaledError = (this.state.formErrors.dateJournaled !== '') ? this.renderError(this.state.formErrors.dateJournaled) : null;
        const ratingError = (this.state.formErrors.rating !== '') ? this.renderError(this.state.formErrors.rating) : null;
        const minutesWaitedError = (this.state.formErrors.minutesWaited !== '') ? this.renderError(this.state.formErrors.minutesWaited) : null;

        // if selected park render attraction picker
        let attractionPicker = null;
        if (this.state.renderAttractions) {
            attractionPicker = this.renderAttractionsPicker(); 
        }

        // render points scored if attraction keeps score
        let pointsScored = null;
        if (this.state.selectedAttraction.attractionHasScore) {
            pointsScored = this.renderPointsScored();
        }


        // Loading Mickey Graphic
        if (this.props.journal.status === 'saving') {
            return (
                <View style={styles.container}>
                    <LoadingMickey />
                </View>
            );
        }

        // Check that parks and attractions exist in redux store
        if (!this.props.parks.parks.length || !this.props.attractions.attractions.length) {
            return (
                <View style={styles.messageContainer}>
                    <Text>Parks and/or attractions data missing. Add better handling later...</Text>
                </View>
            )
        }

        // Render form
        return (
            <View style={styles.container}>
                <View style={styles.parkAttractionSelector}>
                    <TouchableHighlight
                        onPress={() => { this.setParkModalVisible(true); }}>
                            <Text style={styles.parkAttractionText}>{ this.state.selectedPark.parkName !== '' ? this.state.selectedPark.parkName : 'Select a Park'}</Text>
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
                        date={this.state.formValues.dateJournaled}
                        mode="datetime"
                        placeholder="Select Date"
                        format="MM-DD-YYYY, hh:mm a"
                        confirmBtnText="Ok"
                        cancelBtnText="Cancel"
                        onDateChange={this.handleDateJournaledChange}
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
                        checked={this.state.formValues.usedFastPass}
                        onPress={this.handleFastpassChange}
                        containerStyle={styles.fastpass}
                    />
                </View>
                {pointsScored}
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
                    visible={this.state.parkModalVisible}>
                        <View style={styles.modalContainer}>
                            <View style={styles.modalPickerHeader}>
                                <TouchableHighlight
                                style={styles.modalCloseButton}
                                onPress={() => { 
                                    if(this.state.selectedPark.parkRawSelectedValue === '') {
                                        const firstPark = this.props.parks.parks[0];
                                        this.handleParkChange(firstPark.parkid + '^' + firstPark.parkname);
                                    } else {
                                        this.setParkModalVisible(false);
                                    }
                                }}>
                                    <Text style={styles.modalCloseButtonText}>Ok</Text>
                                </TouchableHighlight>
                            </View>
                            <View style={styles.modalPickerBody}>
                                <Picker
                                    selectedValue={this.state.selectedPark.parkRawSelectedValue}
                                    onValueChange={itemValue => this.handleParkChange(itemValue)} >
                                        {this.props.parks.parks.map((i, index) => (
                                            <Picker.Item key={index} label={i.parkname} value={i.parkid + '^' + i.parkname} />
                                        ))}
                                </Picker>
                            </View>
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
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)'
    },
    modalPickerHeader: {
        backgroundColor: 'white',
        borderStyle: 'solid',
        borderBottomWidth: 1,
        borderBottomColor: 'lightgrey'
    },
    modalPickerBody: {
        backgroundColor: 'white'
    },
    modalCloseButton: {
        alignSelf: 'flex-end',
        padding: 10
    },
    modalCloseButtonText: {
        fontSize: 16,
        color: 'blue'
    },
    container: {
        flex: 1
    },
    parkAttractionSelector: {
        flexDirection: 'column',
        marginRight: 25,
        marginLeft: 25
    },
    parkAttractionText: {
        textAlign: 'center',
        fontSize: 20,
        marginTop: 5,
        marginBottom: 5
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
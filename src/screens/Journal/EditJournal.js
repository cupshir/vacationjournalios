import React, { Component } from "react";
import { 
    View, 
    StyleSheet,
    FlatList,
    TextInput,
    TouchableOpacity,
    AlertIOS
} from "react-native";
import { 
    FormLabel, 
    FormInput,
    CheckBox,
    FormValidationMessage,
    Text
} from 'react-native-elements';
import uuid from 'react-native-uuid';
import DatePicker from 'react-native-datepicker';
import { RNCamera } from 'react-native-camera';

import {
    currentUser,
    parkRealm,
    getJournalById,
    saveJournal
} from '../../realm/userService';

import LoadingMickey from '../../components/LoadingMickey';
import ListItem from '../../components/ListItem';

class EditJournal extends Component {
    static navigatorButtons = {
        rightButtons: [
            {
                title: 'Done',
                id: 'done'
            }
        ]
    };

    constructor(props) {
        super(props);
        this.state = { 
            currentUser: null,
            parks: [],
            parks_checked: [],
            formValues: {
                id: '',
                name: '',
                description: '',
                startDate: '',
                endDate: '',
                parks: [],
                photo: '',
                createdDate: '',
                owner: ''                                                             
            },
            formErrors: {
                name: ''
            },
            isLoading: false,
            isEdit: false
        };
        this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
    }

    // handle navigation event
    onNavigatorEvent(event) {
        if (event.id === 'willAppear') {
            this.updateCurrentUserInState(currentUser);
            if (this.props.journalId) {
                // get journal
                getJournalById(this.props.journalId).then((journal) => {
                    // success - pass journal entry to edit screen
                    this.loadJournalIntoState(journal);
                }).catch((error) => {
                    // failed
                    console.log('error: ', error);
                });
            } else {
                this.setState({
                    ...this.state,
                    isLoading: false
                })
            }
        }
        if (event.type == 'NavBarButtonPress') {
            if (event.id == 'done') {
                this.handleDone();
            } 
        }
    }

    componentWillMount() {
        let park_checked = [];
        const parks = parkRealm.objects('Park');

        parks.forEach((park) => {
            park_checked.push(false)
        });

        this.setState({
            ...this.state,
            parks: parks,
            parks_checked: park_checked
        })
        
    }

    componentDidMount() {
        this.props.navigator.setStyle({
            navBarNoBorder: false
        })
    }

    loadJournalIntoState= (journal) => {
        if (journal) {
            this.setState({
                ...this.state,
                formValues: {
                    id: journal.id,
                    name: journal.name,
                    startDate: journal.startDate,
                    endDate: journal.endDate,
                    parks: journal.parks,
                    photo: journal.photo,
                    createdDate: journal.dateCreated,
                    owner: journal.owner                                                             
                },
                isLoading: false,
                isEdit: true
            })

        }
    }

    updateCurrentUserInState = (user) => {
        if (user) {
            this.setState({
                ...this.state,
                currentUser: user
            });
        } else {
            this.setState({
                ...this.state,
                currentUser: null
            });
        }
    }

    // handle save event
    handleDone = () => {
        // Check if ready to submit
        const ready = this.readyForSubmit(this.state.formValues);

        if(ready) {
            const submitValues = this.prepareValuesForDB(this.state.formValues);

            saveJournal(submitValues, this.state.isEdit).then((journal) => {
                // Success - stop animation
                this.setState({
                    ...this.state,
                    isLoading: false
                });
                // Navigate back to journal screen
                this.props.navigator.push({
                    screen: 'vacationjournalios.Journal',
                    title: journal.name,
                    animated: true,
                    animationType: 'fade'
                });
            }).catch((error) => {
                // Failed - stop animation
                this.setState({
                    ...this.state,
                    isLoading: false
                });
            });
        } else {
            AlertIOS.alert('Missing Name, Start Date, or End Date');
        }
    }

    prepareValuesForDB = (values) => {
        // Create return object
        let returnValues = {
            id: '',
            name: '',
            startDate: '',
            endDate: '',
            parks: [],
            photo: '',
            owner: '',
            createdDate: '',
        };

        // use existing journal id if exists, otherwise create new id
        returnValues.id = (values.id !== '') ? values.id : uuid.v4();

        returnValues.name = values.name;
        returnValues.startDate = new Date(values.startDate);
        returnValues.endDate = new Date(values.endDate);
        returnValues.parks = values.parks;
        returnValues.photo = values.photo;
        returnValues.owner = (values.owner !== '') ? values.owner : this.state.currentUser.id;
        returnValues.createdDate = values.createdDate ? values.createdDate : new Date();

        return returnValues;
    }

    // Check if form is ready for submit and return true/false
    readyForSubmit = (values) => {
        let ready = true;

        // Check that required formValues have a value, if value missing return false
        if (values.name === '') {
            return false;
        }

        if (values.startDate === '') {
            return false;
        }

        if (values.endDate === '') {
            return false;
        }

        // If all values present, Check that there are no formError messages
        if(ready) {
            ready = !this.checkForErrorMessages();
        }

        return ready;
    }

    // Check if error messages exist in state and return true/false
    checkForErrorMessages = () => {
        let errorCount = 0;
        Object.entries(this.state.formErrors).forEach(([key, val]) => {
            if (val || val === '') {
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

    // handle name change
    handleNameChange = (value) => {
        let nameError;

        // Check input for errors, if found set error message
        if (!value) {
            nameError = 'Please enter a journal name.';
        }

        // Set state and error messages
        this.setState({ 
            formValues: {
                ...this.state.formValues, 
                name: value
            },
            formErrors: {
                ...this.state.formErrors,
                name: nameError
            }
        });
    }

    // handle description change
    handleDescriptionChange = (value) => {
        this.setState({
            formValues: {
                ...this.state.formValues,
                description: value
            }
        });
    }
    
    // handle start date change
    handleStartDateChange = (date) => {
        this.setState({
            formValues: {
                ...this.state.formValues,
                startDate: date
            }
        })
    }

    // handle date change
    handleEndDateChange = (date) => {
        this.setState({
            formValues: {
                ...this.state.formValues,
                endDate: date
            }
        })
    }

    handleParkChecked = (index) => {
        this.state.parks.forEach((park) => {
            if (index.id === park.id) {
                console.log('Match: ', park.name);
            }
        });
       console.log('index: ', index);
    }

    // render row item
    renderItem = ({ item,index }) => (
        <CheckBox
            title={item.name}
            checked={this.state.parks_checked[index]}
            onPress={this.handleParkChecked}
        />

    );

    render() {
        // Check if errors exist in state.formErrors
        const nameError = (this.state.formErrors.name !== '') ? this.renderError(this.state.formErrors.name) : null;
        
        // Loading Mickey Graphic
        if (this.state.isLoading) {
            return (
                <View style={styles.container}>
                    <LoadingMickey />
                </View>
            );
        }

        return (
            <View style={styles.container}>
                <View style={styles.form}>
                    <TextInput 
                        style={styles.input}
                        onChangeText={this.handleNameChange}
                        placeholder='Enter journal name'
                        value={this.state.formValues.name}
                    />
                    {nameError}
                    <TextInput 
                        style={styles.descriptionInput}
                        multiline={true}
                        numberOfLines={2}
                        maxLength={400}
                        onChangeText={this.handleDescriptionChange}
                        placeholder='Enter journal description'
                        value={this.state.formValues.description}
                    />
                    <DatePicker
                        style={styles.datepicker}
                        date={this.state.formValues.startDate}
                        mode="date"
                        placeholder="Select Date"
                        format="MM/DD/YYYY"
                        confirmBtnText="Ok"
                        cancelBtnText="Cancel"
                        onDateChange={this.handleStartDateChange}
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
                    <DatePicker
                        style={styles.datepicker}
                        date={this.state.formValues.endDate}
                        mode="date"
                        placeholder="Select Date"
                        format="MM/DD/YYYY"
                        confirmBtnText="Ok"
                        cancelBtnText="Cancel"
                        onDateChange={this.handleEndDateChange}
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
                    <View>
                        {/* <FlatList
                            data={this.state.parks}
                            renderItem={this.renderItem}
                            keyExtractor={item => item.id} /> */}
                    </View>
                </View>
            </View> 
        );
    }
}

var styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'stretch'
    },
    form: {
        margin: 15
    },
    input: {
        padding: 5,
        borderWidth: .5,
        borderColor: '#aaa',
        borderRadius: 5,
    },
    descriptionInput: {
        padding: 5,
        borderWidth: .5,
        borderColor: '#aaa',
        borderRadius: 5,
        height: 75
    }
})

export default EditJournal;
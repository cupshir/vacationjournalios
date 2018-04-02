import React, { Component } from "react";
import { 
    View, 
    StyleSheet,
    TextInput,
    AlertIOS
} from "react-native";
import { 
    FormLabel, 
    FormInput,
    FormValidationMessage,
    Text
} from 'react-native-elements';

import {
    currentUser,
    createJournal
} from '../../realm/userService';

import LoadingMickey from '../../components/LoadingMickey';

class CreateJournal extends Component {
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
            formValues: {
                journalName: ''                                                             
            },
            formErrors: {
                journalName: ''
            },
            isLoading: false
        };
        this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
    }

    // handle navigation event
    onNavigatorEvent(event) {
        if (event.id === 'willAppear') {
            this.updateCurrentUserInState(currentUser);
        }
        if (event.type == 'NavBarButtonPress') {
            if (event.id == 'done') {
                this.handleDone();
            } 
        }
    }

    componentDidMount() {
        this.props.navigator.setStyle({
            navBarNoBorder: false
        })
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
        const ready = this.readyForSubmit(this.state.formValues)

        if(ready) {
            createJournal(this.state.formValues.journalName, this.state.currentUser).then((newJournal) => {
                // Success - stop animation
                this.setState({
                    ...this.state,
                    isLoading: false
                });
                // Navigate back to journal screen
                this.props.navigator.push({
                    screen: 'vacationjournalios.Journal',
                    title: newJournal.name,
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
            AlertIOS.alert('Please enter a journal name');
        }
    }

    // Check if form is ready for submit and return true/false
    readyForSubmit = (values) => {
        let ready = true;

        // Check that each formValue has a value, if value missing return false
        Object.entries(values).forEach(([key, val]) => {
            if(val === '') {
                ready = false;
            }
        });

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

    handleJournalNameChange = (value) => {
        let journalNameError;

        // Check input for errors, if found set error message
        if (!value) {
            journalNameError = 'Please enter a journal name.';
        }

        // Set state and error messages
        this.setState({ 
            formValues: {
                ...this.state.formValues, 
                journalName: value
            },
            formErrors: {
                ...this.state.formErrors,
                journalName: journalNameError
            }
        });
    }
    
    render() {
        // Check if errors exist in state.formErrors
        const journalNameError = (this.state.formErrors.journalName !== '') ? this.renderError(this.state.formErrors.journalName) : null;
        
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
                        multiline={true}
                        numberOfLines={2}
                        maxLength={400}
                        onChangeText={this.handleJournalNameChange}
                        placeholder='Enter journal name'
                    />
                    {journalNameError}
                    <Text>What other attributes should a journal have? date?</Text>
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
        height: 75
    }
})

export default CreateJournal;
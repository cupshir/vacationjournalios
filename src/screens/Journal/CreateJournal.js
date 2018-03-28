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
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as userActions from '../../store/actions/userActions';

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
            formValues: {
                journalName: ''                                                             
            },
            formErrors: {
                journalName: ''
            }
        };
        this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
    }

    // handle navigation event
    onNavigatorEvent(event) {
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

    // handle save event
    handleDone = () => {
        if(this.props.user.userId) {
            // Check if ready to submit
            const ready = this.readyForSubmit(this.state.formValues)

            if(ready) {
                const realmUser = userActions.userRealm.objectForPrimaryKey('Person', this.props.user.userId);
                this.props.dispatch(userActions.createJournal(this.state.formValues.journalName, realmUser));
                this.props.navigator.push({
                    screen: 'vacationjournalios.Journal',
                    title: this.state.formValues.vacationName,
                    animated: true,
                    animationType: 'fade'
                });
            } else {
                AlertIOS.alert('Please enter a journal name');
            }
        } else {
            AlertIOS.alert('Please sign in on profile page');
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
        if (this.props.user.status === 'saving') {
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

function mapStateToProps(state) {
    return {
      user: state.user
    }
}

export default connect(mapStateToProps)(CreateJournal);
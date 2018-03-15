import React, { Component } from "react";
import { 
    View, 
    StyleSheet ,
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
import * as journalActions from '../../store/actions/journalActions';

import LoadingMickey from '../../components/LoadingMickey';

class CreateJournal extends Component {
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
            formValues: {
                vacationName: ''                                                             
            },
            formErrors: {
                vacationName: ''
            }
        };
        this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
    }

    // handle navigation event
    onNavigatorEvent(event) {
        if (event.type == 'NavBarButtonPress') {
            if (event.id == 'save') {
                this.handleSave();
            } 
        }
    }

    // handle save event
    handleSave = () => {
        if(this.props.user.userid) {
            // Check if ready to submit
            const ready = this.readyForSubmit(this.state.formValues)

            if(ready) {
                this.props.dispatch(journalActions.createJournal(this.state.formValues.vacationName, this.props.user.userid));
                this.props.navigator.popToRoot();
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

    handleVacationNameChange = (value) => {
        let vacationNameError;

        // Check input for errors, if found set error message
        if (!value) {
            vacationNameError = 'Please enter a vacation name.';
        }

        // Set state and error messages
        this.setState({ 
            formValues: {
                ...this.state.formValues, 
                vacationName: value
            },
            formErrors: {
                ...this.state.formErrors,
                vacationName: vacationNameError
            }
        });
    }
    
    render() {
        // Check if errors exist in state.formErrors
        const vacationNameError = (this.state.formErrors.vacationName !== '') ? this.renderError(this.state.formErrors.vacationName) : null;
        
        // Loading Mickey Graphic
        if (this.props.journal.status === 'saving') {
            return (
                <View style={styles.container}>
                    <LoadingMickey />
                </View>
            );
        }

        return (
            <View style={styles.container}>
                <View style={styles.form}>
                    <FormLabel>Name for new Journal</FormLabel>
                    <FormInput 
                        onChangeText={this.handleVacationNameChange}
                        placeholder='Enter vacation name'
                    />
                    {vacationNameError}
                </View>
            </View> 
        );
    }
}

var styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    form: {
        width: 300
    }
})

function mapStateToProps(state) {
    return {
      journal: state.journal,
      user: state.user
    }
}

export default connect(mapStateToProps)(CreateJournal);
import React, { Component } from "react";
import { 
    View, 
    StyleSheet 
} from "react-native";
import { 
    FormLabel, 
    FormInput,
    FormValidationMessage,
    Text
} from 'react-native-elements';

class CreateJournal extends Component {
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
        return (
            <View>
                <FormLabel>Vacation Name</FormLabel>
                <FormInput 
                    onChangeText={this.handleVacationNameChange}
                    placeholder='Enter vacation name'
                />
            </View> 
        );
    }
}

export default CreateJournal;   

import React, { Component } from 'react';
import {
    View,
    StyleSheet,
    AlertIOS
} from 'react-native';
import { 
    Button,
    FormLabel, 
    FormInput,
    FormValidationMessage,
    Text
     } from 'react-native-elements';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as userActions from '../../store/actions/userActions';

import LoadingMickey from '../../components/LoadingMickey'

class SignIn extends Component {
    static navigatorButtons = {
        rightButtons: [
            {
                title: 'Sign In',
                id: 'signIn'
            }
        ],
        leftButtons: [
            {
                title: 'Cancel',
                id: 'cancel'
            }
        ]
    };

    constructor(props) {
        super(props);
        this.state = { 
            formValues: {
                email: '',
                password: ''
            },
            formErrors: {
                email: '',
                password: ''
            }
        };
        this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
    }

    // handle navigation event
    onNavigatorEvent(event) {
        if (event.type == 'NavBarButtonPress') {
            if (event.id == 'signIn') {
                this.handleSignIn();
            } else if (event.id =='cancel') {
                this.props.navigator.dismissModal({});
            }
        }
    }

    // Handle Email input change
    handleEmailChange = (value) => {
        let emailError;

        // Check input for errors, if found set error message
        if (!value) {
            emailError = 'Please enter an email.';
        } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,8}$/i.test(value)) {
            emailError = 'Invalid email address.'
        }

        // Set state and error messages
        this.setState({ 
            formValues: {
                ...this.state.formValues, 
                email: value
            },
            formErrors: {
                ...this.state.formErrors,
                email: emailError
            },
            loadingModalActive: false
        });
    }

    // Handle Password input change
    handlePasswordChange = (value) => {
        let passwordError;

        // Check input for errors, if found set error message
        if (!value) {
            passwordError = 'Please enter a password.';
        }

        // Set state and error messages
        this.setState({ 
            formValues: {
                ...this.state.formValues, 
                password: value
            },
            formErrors: {
                ...this.state.formErrors,
                password: passwordError
            }
        });
    }

    // Handle Sign In Press
    handleSignIn = () => {
        // Check if ready to submit
        const ready = this.readyForSubmit(this.state.formValues)

        if(ready) {
            // TODO: Modify SignIn to be a Modal and dismiss modal sign in successful
            this.props.dispatch(userActions.signInUser(this.state.formValues.email,this.state.formValues.password));
        } else {
            AlertIOS.alert('Please enter a valid email address and password')
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

    handleDismissModal = () => {
        this.props.navigator.dismissModal({});
    }

    showLoadingModal = () => {
        this.setState({
            ...this.state,
            loadingModalActive: true
        });
        this.props.navigator.showModal({
            screen: 'vacationjournalios.LoadingModal',
            animated: true
        });
    }

    dismissLoadingModal = () => {
        this.setState({
            ...this.state,
            loadingModalActive: false
        });
        this.props.navigator.dismissModal({});
    }

    render() {        
        // Check if errors exist in state.formErrors
        const emailError = (this.state.formErrors.email !== '') ? this.renderError(this.state.formErrors.email) : null;
        const passwordError = (this.state.formErrors.password !== '') ? this.renderError(this.state.formErrors.password) : null;

        // Check if authentication errors exist in redux store
        const authenticationError = (this.props.authenticationStatus === 'failed') ? this.renderError(this.props.authenticationErrorMessage) : null;


        // Loading Mickey Graphic
        if (this.props.authenticationStatus === 'requesting') {
            return (
              <View style={styles.container}>
                <LoadingMickey />
              </View>
            );
        }
        
        // Render Sign In Form
        return (
        <View style={styles.container}>
            <View style={styles.upper}>
                <Text style={styles.image}>Sign In Graphic</Text>
            </View>
            <View style={styles.lower}>
                <View>
                    {authenticationError}
                    <FormLabel>Email</FormLabel>
                    <FormInput 
                        onChangeText={this.handleEmailChange}
                        placeholder='Enter email address'
                        autoCapitalize='none'
                        autoCorrect={false}
                    />
                    {emailError}
                    <FormLabel>Password</FormLabel>
                    <FormInput 
                        onChangeText={this.handlePasswordChange}
                        placeholder='Enter password'
                        secureTextEntry={true}
                        autoCapitalize='none'
                        autoCorrect={false}
                        spellCheck={false} 
                    />
                    {passwordError}
                </View>
            </View>
        </View>
        )
    }
}

var styles = StyleSheet.create({
    container: {
        flex: 1
    },
    upper: {
        flex: .5,
        marginTop: 25,
        marginRight: 25,
        marginLeft: 25,
    },
    lower: {
        flex: .4,
        marginBottom: 50,
        marginRight: 25,
        marginLeft: 25,
    },
    image: {
        flex: .9,
        backgroundColor: '#C7D0FE',
        borderWidth: 1
    },
    form: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 5
    }
});

function mapStateToProps(state) {
    return {
      authenticationErrorMessage: state.user.authenticationErrorMessage,
      authenticationStatus: state.user.authenticationStatus,
      authenticated: state.user.authenticated
    }
  }

export default connect(mapStateToProps)(SignIn);
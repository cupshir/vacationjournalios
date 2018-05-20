import React, { Component } from "react";
import { 
    AlertIOS,
    Image,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { 
    FormValidationMessage,
    Text
} from 'react-native-elements';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Icon from 'react-native-vector-icons/Ionicons';
import uuid from 'react-native-uuid';
import DatePicker from 'react-native-datepicker';

import * as UserService from '../../realm/userService';

import LoadingMickey from '../../components/LoadingMickey';

class EditPark extends Component {
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
                id: '',
                name: '',
                photo: '',
                description: '',
                dateCreated: '',
                dateModified: '',
                dateSynced: '',                                                                         
            },
            formErrors: {
                name: '',
            },
            parkLoaded: false,
            isLoading: true,
            isEdit: false
        };
        this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
    }

    // handle navigation events
    onNavigatorEvent(event) {
        if (event.id === 'willAppear') {
            this.updateCurrentUserInState(UserService.currentUser);
            // check if a journal id was passed, if so update state with journal data
            if (this.props.parkId) {
                // get park
                const park = UserService.parkRealm.objectForPrimaryKey('Park', this.props.parkId);

                this.loadParkIntoState(park);

            } else if (!this.state.parkLoaded) {
                // New park - disable loading animation
                this.setState({
                    ...this.state,
                    parks: this.addCheckedPropertyToParks(),
                    isLoading: false
                });
            }
        }
        if (event.type == 'NavBarButtonPress') {
            if (event.id == 'done') {
                this.handleDone();
            }
        }
    }

    // Navbar styling
    componentDidMount() {
        this.props.navigator.setStyle({
            navBarNoBorder: false
        })
    }

    // loads journal data into state and flags isEdit true
    loadParkIntoState= (park) => {
        if (park) {
            this.setState({
                ...this.state,
                formValues: {
                    id: park.id,
                    name: park.name,
                    photo: park.photo,
                    description: park.description,
                    dateCreated: park.dateCreated,
                    dateModified: park.dateModified,
                    dateSynced: park.dateSynced                                                         
                },
                parkLoaded: true,
                isLoading: false,
                isEdit: true
            });
        }
    }

    // loads current user object into state if exists
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

    // photo delete press event
    onPhotoDeletePress = () => {
        // display confirm prompt, user must type CONFIRM to delete photo
        AlertIOS.alert(
            'Confirm Delete',
            'Are you sure you want to delete the journal image?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel'
                },
                {
                    text: 'Delete',
                    onPress: () => this.handleDeletePhoto()
                }
            ]
        );
    }

    // handle photo delete
    handleDeletePhoto = () => {
        this.setState({
            formValues: {
                ...this.state.formValues,
                photo: ''
            }
        });
    }

    // handle park save event
    handleDone = () => {
        // Check if ready to submit
        const ready = this.readyForSubmit(this.state.formValues);

        if(ready) {
            // start loading animation
            this.setState({
                ...this.state,
                isLoading: true
            });

            // Prep values for realm save
            const submitValues = this.prepareValuesForDB(this.state.formValues);

            // save park to realm
            UserService.adminSavePark(submitValues)
                .then((park) => {
                    // Success - stop animation
                    this.setState({
                        ...this.state,
                        isLoading: false
                    });
                    console.log('save successful');
                    this.props.navigator.popToRoot();
                }).catch((error) => {
                    console.log('error: ');
                    console.log(error);
                    // Failed - stop animation
                    this.setState({
                        ...this.state,
                        isLoading: false
                    });
                });
        } else {
            AlertIOS.alert('Please correct form errors and try again.');
        }        
    }

    // prep return values for realm
    prepareValuesForDB = (values) => {
        // Create return object
        let returnValues = {
            id: '',
            name: '',
            photo: '',
            dateCreated: '',
            dateModified: '',
            dateSynced: '',
            description: ''
        };

        // use existing journal id if exists, otherwise create new id
        returnValues.id = (values.id !== '') ? values.id : uuid.v4();

        returnValues.name = values.name;
        returnValues.photo = values.photo;
        returnValues.dateCreated = (values.dateCreated !== '') ? values.dateCreated : new Date();
        returnValues.dateModified = (values.dateModified !== '') ? values.dateModified : new Date();
        returnValues.dateSynced = (values.dateSynced !== '') ? values.dateSynced : new Date();
        returnValues.description = values.description;

        return returnValues;
    }

    // Check if form is ready for submit and return true/false
    readyForSubmit = (values) => {
        let ready = true;
        let nameError = (this.state.formErrors.name !== '') ? this.state.formErrors.name : '';

        // Check that required formValues have a value, if value missing update error message and return false
        if (values.name === '') {
            nameError = 'Name';
            ready = false;
        }

        // check for an error messages and return false if found
        if (nameError !== '') {
            ready = false;
        }

        // update form errors in state
        this.setState({
            formErrors: {
                ...this.state.formErrors,
                name: nameError,
            }
        });

        return ready;
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
        let nameError = '';

        // Check input for errors, if found set error message
        if (!value) {
            nameError = 'Name';
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

    // render photo image
    renderPhoto = (photo) => {
        return (
            <TouchableOpacity
                onLongPress={() => { this.onPhotoDeletePress(); }} 
            >
                <View style={styles.photo}>
                    <Image 
                        style={{ width: 300, height: 300 }}
                        resizeMode={'cover'}
                        source={{uri: `data:image/png;base64,${photo}`}} 
                    />
                </View>
            </TouchableOpacity>
        );
    }

    render() {
        // Loading Mickey Graphic
        if (this.state.isLoading) {
            return (
                <View style={styles.container}>
                    <LoadingMickey />
                </View>
            );
        }

        // render photo or camera button
        const photo = (this.state.formValues.photo !== '') 
        ? this.renderPhoto(this.state.formValues.photo) 
        : null

        return (
            <KeyboardAwareScrollView style={styles.container}>
                <View style={styles.form}>
                    <TextInput 
                        style={[
                            styles.input,
                            (this.state.formErrors.name !== '') ? styles.error : null
                        ]}
                        onChangeText={this.handleNameChange}
                        placeholder='Enter Park name'
                        value={this.state.formValues.name}
                        placeholderTextColor={'#444444'}
                    />
                    <View style={styles.photoSection}>
                        {photo}
                    </View>
                    <TextInput 
                        style={styles.descriptionInput}
                        multiline={true}
                        numberOfLines={2}
                        maxLength={400}
                        onChangeText={this.handleDescriptionChange}
                        placeholder='Enter park description'
                        value={this.state.formValues.description}
                        placeholderTextColor={'#444444'}
                    />
                </View>
            </KeyboardAwareScrollView> 
        );
    }
}

var styles = StyleSheet.create({
    container: {
        flex: 1
    },
    form: {
        margin: 15
    },
    input: {
        padding: 10,
        borderRadius: 5,
        backgroundColor: '#AAAAAA'
    },
    photoSection: {
        padding: 15
    },
    photo: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    descriptionInput: {
        backgroundColor: '#AAAAAA',
        padding: 5,
        borderRadius: 5,
        height: 75,
        marginBottom: 15
    },
    error: {
        borderWidth: 1,
        borderColor: 'red'
    }
})

export default EditPark;
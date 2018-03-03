import React, { Component } from 'react';
import {
    View,
    StyleSheet,
    TextInput,
    AlertIOS
} from 'react-native';
import { 
    Button,
    FormLabel, 
    FormInput,
    Rating,
    CheckBox,
    Text
} from 'react-native-elements';
import DatePicker from 'react-native-datepicker';
import { Dropdown } from 'react-native-material-dropdown';

export default class JournalEntry extends Component {
    constructor(props) {
        super(props);
        this.state = {
            formValues: {
                park: '',
                attraction: '',
                journaledDate: new Date(),
                minutesWaited: '',
                fastpassUsed: false,
                rating: 0,
                points: '',
                comments: ''
            }

        };
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
            formValues: {
                ...this.state.formValues,
                park: itemValue
            }
        })
    }

    // handle attraction change
    handleAttractionChange = (itemValue, itemIndex) => {
        this.setState({
            formValues: {
                ...this.state.formValues,
                attraction: itemValue
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
        AlertIOS.alert(this.state.formValues);
    }

    // render View
    render() {
        const readyForSubmit = true;

        let testParkData = [
            { value: '1', label: 'Disneyland' },
            { value: '2', label: 'California Adventure' },
            { value: '3', label:  'Magic Kingdom' }
        ];

        let testAttractionData = [
            { value: '1', label: 'Space Mountain' },
            { value: '2', label: 'California Screamin' },
            { value: '3', label:  'Toystory Midway Mania' }
        ];

        return (
            <View style={styles.container}>
                <View style={styles.parkAttractionSelector}>
                    <Dropdown
                        label='Select Park'
                        data={testParkData}
                        onChangeText={this.handleParkChange}
                    />
                    <Dropdown
                        label='Select Attraction'
                        data={testAttractionData}
                        onChangeText={this.handleAttractionChange}
                    />
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
                <View style={styles.buttons}>
                    <Button
                        raised={true}
                        title='Save'
                        buttonStyle={styles.button}
                        backgroundColor='#387EF7'
                        disabled={!readyForSubmit}
                        onPress={this.handleSavePress}
                    />
                </View>
            </View>
        )
    }
}

var styles = StyleSheet.create({
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
        height: 250
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
    },
    buttons: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 10
    },
    button: {
        borderRadius: 5,
        width: 100
    }
});

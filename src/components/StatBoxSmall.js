import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { 
  Text, 
  View,
  StyleSheet
} from 'react-native';

class StatBoxSmall extends Component {
  render(props) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>
          {this.props.title}
        </Text>
      </View>
    );
  }
}

var styles = StyleSheet.create({
  container: {
    height: 100,
    width: 100,
    borderColor: 'gray',
    borderWidth: 1,
    marginTop: 5,
    marginBottom: 5,
    marginLeft: 5,
    marginRight: 5,
    backgroundColor: '#C7D0FE'
  },
  text: {
    textAlign: 'center'
  }
})

StatBoxSmall.propTypes = {  
  title: PropTypes.string.isRequired,
  journalEntry: PropTypes.string.isRequired
};

export default StatBoxSmall;

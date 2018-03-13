import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { 
  Text, 
  View,
  StyleSheet
} from 'react-native';

class StatBoxLarge extends Component {
  render(props) {
    return (
      <View style={styles.container}>
        <View style={styles.image}>
          <Text>
            Image
          </Text>
        </View>
        <View style={styles.content}>
          <View style={styles.title}>
            <Text>
              {this.props.title}
            </Text>
          </View>
          <View>
            <Text>
              {this.props.journalEntry}
            </Text>
          </View>
        </View>
      </View>
    );
  }
}

var styles = StyleSheet.create({
  container: {
    height: 100,
    flexDirection: 'row',
    borderColor: 'gray',
    borderWidth: 1,
    marginTop: 5,
    marginBottom: 5,
    marginLeft: 10,
    marginRight: 10 
  },
  image: {
    flex: .4,
    backgroundColor: '#C7D0FE'
  },
  content: {
    flex: .6
  }
})

StatBoxLarge.propTypes = {  
  title: PropTypes.string.isRequired,
  journalEntry: PropTypes.string.isRequired
};

export default StatBoxLarge;

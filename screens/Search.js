import React, { Component } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import styles from './styles'

export default class SearchScreen extends Component {
    render() {
        return (
            <View style={styles.container}>
                <Text style={styles.text}>Tela de Pesquisa</Text>
            </View>
        )
    }

}
import React,{Component} from 'react';
import { Rajdhani_600SemiBold } from '@expo-google-fonts/rajdhani';
import * as Font from 'expo-font'

import BottomTabNavigator from './components/BottonTabNavigator';
import Login from './screens/Login';
import { createSwitchNavigator, createAppContainer } from 'react-navigation';


export default class App extends Component{
  //criando os states
  constructor(){
    super()
    this.state = {
      fontLoaded:false
    }
  }

  //função que carrega as fontes
  async loadFonts(){
    await Font.loadAsync({
      Rajdhani_600SemiBold:Rajdhani_600SemiBold
    })
    this.setState({fontLoaded:true})
  }

  //carregando as fontes na montagem do componente
  componentDidMount(){
    this.loadFonts()
  }
  
  render(){
    const {fontLoaded} = this.state //carregando o state na variável
    if (fontLoaded) {
      return(
        <AppContainer />//se a fonte carregar mostrar a tela
      )
    }
    return null
    
  }
}

//criando as rotas
const AppSwitchNavigator = createSwitchNavigator(
  {
    Login:{
      screen: Login
    },
    BottomTab:{
      screen: BottomTabNavigator
    }
  },
  {
    initialRouteName:"Login" //definindo login como a tela inicial
  }
)

const AppContainer = createAppContainer(AppSwitchNavigator)

import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import moment from 'moment';
import 'moment/locale/pt-br';

export function Lobby() {
  const [selectedDate, setSelectedDate] = useState(moment().format('YYYY-MM-DD'));
  const flatListRef = useRef<FlatList>(null); 
  const Tab = createBottomTabNavigator();

  
  moment.locale('pt-br');

  
  const generateDays = () => {
    let days = [];
    for (let i = -15; i <= 15; i++) {
      const day = moment().add(i, 'days');
      days.push({
        dateString: day.format('YYYY-MM-DD'),
        dayNumber: day.format('D'),
        dayName: day.format('ddd'),
      });
    }
    return days;
  };

  const days = generateDays();

 
  const todayIndex = days.findIndex(day => day.dateString === moment().format('YYYY-MM-DD'));


  useEffect(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToIndex({ index: todayIndex, animated: true });
    }
  }, [todayIndex]);

  function HomeTabScreen() {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Bem vindo, Usuário.</Text>


        <View style={styles.calendarWrapper}>
          <FlatList
            ref={flatListRef} 
            data={days}
            horizontal
            keyExtractor={(item) => item.dateString}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => setSelectedDate(item.dateString)}
                style={[
                  styles.dayItem,
                  item.dateString === selectedDate && styles.selectedDayItem,
                ]}
              >
                <Text
                  style={[
                    styles.dayText,
                    item.dateString === selectedDate && styles.selectedDayText,
                  ]}
                >
                  {item.dayName}
                </Text>
                <Text
                  style={[
                    styles.dayNumberText,
                    item.dateString === selectedDate && styles.selectedDayNumberText,
                  ]}
                >
                  {item.dayNumber}
                </Text>
              </TouchableOpacity>
            )}
            showsHorizontalScrollIndicator={false}
            initialScrollIndex={todayIndex} 
            getItemLayout={(data, index) => ({
              length: 70, 
              offset: 70 * index,
              index,
            })} 
          />
        </View>


        <View style={styles.contentBox}>
          <Text style={styles.infoText}>
            Treino do dia {moment(selectedDate).format('DD/MM/YYYY')}
          </Text>
          <Text style={styles.infoDetails}>Detalhes do treino...</Text>
        </View>
      </View>
    );
  }

  function SettingsScreen() {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Configurações</Text>
      </View>
    );
  }

  function Home() {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Configurações</Text>
      </View>
    );
  }

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string = 'ios-help-circle-outline';


          if (route.name === 'Treinos') {
            iconName = focused ? 'barbell' : 'barbell-outline';
          } else if (route.name === 'Ajustes') {
            iconName = focused ? 'settings' : 'settings-outline';
          } else if (route.name === 'Inicio') {
            iconName = focused ? 'home' : 'home-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#FF8C00', 
        tabBarInactiveTintColor: '#CECECE',
        tabBarStyle: styles.navigatorStyle,
      })}
    >
      <Tab.Screen name="Inicio" component={Home} options={{ headerShown: false }} />
      <Tab.Screen name="Treinos" component={HomeTabScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Ajustes" component={SettingsScreen} options={{ headerShown: false }} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121015',
    paddingTop: 50,
  },
  title: {
    fontSize: 30,
    marginBottom: 10, 
    marginLeft: 20,
    color: '#FF8C00',
    fontWeight: 'bold',
  },
  calendarWrapper: {
    marginBottom: 20, 
  },
  dayItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10, 
    paddingVertical: 5, 
    marginHorizontal: 5, 
    borderRadius: 8,
    backgroundColor: '#222',
    width: 60,
    height: 70,
  },
  selectedDayItem: {
    backgroundColor: '#FF8C00',
  },
  dayText: {
    color: '#CECECE',
    fontSize: 12, 
  },
  selectedDayText: {
    color: '#FFF',
  },
  dayNumberText: {
    color: '#FFF',
    fontSize: 14, 
    fontWeight: 'bold',
  },
  selectedDayNumberText: {
    color: '#FFF',
  },
  contentBox: {
    flex: 1,
    padding: 20,
    backgroundColor: '#222',
    borderRadius: 10,
  },
  infoText: {
    fontSize: 20,
    color: '#FF8C00',
    fontWeight: 'bold',
  },
  infoDetails: {
    fontSize: 16,
    color: '#CECECE',
    marginTop: 10,
  },
  navigatorStyle: {
    backgroundColor: '#121015',
  },
});

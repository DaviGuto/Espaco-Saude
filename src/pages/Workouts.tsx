import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import moment from 'moment';
import 'moment/locale/pt-br'; // Importando a localidade pt-br

export function Workouts() {
  const [selectedDate, setSelectedDate] = useState(moment().format('YYYY-MM-DD'));
  const flatListRef = useRef<FlatList>(null); // Referência para a FlatList
  const Tab = createBottomTabNavigator();

  // Definindo pt-br como localidade padrão
  moment.locale('pt-br');

  // Função para gerar dias da semana a partir da data atual
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

  // Encontra o índice do dia atual na lista de dias
  const todayIndex = days.findIndex(day => day.dateString === moment().format('YYYY-MM-DD'));

  // Quando o componente é montado, rola para o dia atual
  useEffect(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToIndex({ index: todayIndex, animated: true });
    }
  }, [todayIndex]);

  function HomeTabScreen() {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Bem vindo, Usuário.</Text>

        {/* Calendário horizontal */}
        <View style={styles.calendarWrapper}>
          <FlatList
            ref={flatListRef} // Adiciona a referência à FlatList
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
            initialScrollIndex={todayIndex} // Garante que o dia atual seja o inicial
            getItemLayout={(data, index) => ({
              length: 70, // Largura de cada item
              offset: 70 * index,
              index,
            })} // Para evitar erros de desempenho
          />
        </View>

        {/* Informações do treino */}
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
          let iconName: string = 'ios-help-circle-outline'; // Valor padrão

          // Definindo o ícone com base na rota
          if (route.name === 'Treinos') {
            iconName = focused ? 'barbell' : 'barbell-outline';
          } else if (route.name === 'Ajustes') {
            iconName = focused ? 'settings' : 'settings-outline';
          } else if (route.name === 'Inicio') {
            iconName = focused ? 'home' : 'home-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#FF8C00', // Cor do ícone/texto ativo
        tabBarInactiveTintColor: '#CECECE', // Cor do ícone/texto inativo
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
    marginBottom: 10, // Controla o espaço abaixo do título
    marginLeft: 20,
    color: '#FF8C00',
    fontWeight: 'bold',
  },
  calendarWrapper: {
    marginBottom: 20, // Controla o espaço entre o calendário e a caixa de treinos
  },
  dayItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10, // Menor espaçamento horizontal
    paddingVertical: 5, // Menor espaçamento vertical
    marginHorizontal: 5, // Espaço entre os itens
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
    fontSize: 12, // Diminuindo o tamanho da fonte do nome do dia
  },
  selectedDayText: {
    color: '#FFF',
  },
  dayNumberText: {
    color: '#FFF',
    fontSize: 14, // Diminuindo o tamanho da fonte do número do dia
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

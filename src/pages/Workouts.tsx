import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal,} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import moment from 'moment';
import 'moment/locale/pt-br';




export function Workouts() {
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
    const [configWorkout, setConfigWorkout] = useState(false);
    const [selectedDate, setSelectedDate] = useState(moment().format('YYYY-MM-DD')); // Inicializa com a data de hoje
    const flatListRef = useRef<FlatList<any>>(null);

  
    useEffect(() => {
      if (flatListRef.current) {
        flatListRef.current.scrollToIndex({ index: todayIndex, animated: true });
      }
    }, [todayIndex]);
  
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Cronograma de Treinos.</Text>
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
        
        <TouchableOpacity 
          
          style={[styles.buttonEditPost, 
          { width: 60, height: 60, right: 30, backgroundColor: '#333' }]}
        >
          <Ionicons name="add-outline" size={40} color="#FF8C00" />
        </TouchableOpacity>
  
        <Modal 
          visible={configWorkout}
          transparent 
          onRequestClose={() => setConfigWorkout(false)}
          animationType="fade"
        >
          <View style={styles.modalContainer}>
            <TouchableOpacity 
              style={styles.buttomAddPost} 
              onPress={() => {}}
            >
              <Text style={styles.modalOption}>Adicionar ao carrossel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.buttomAddPost, { marginTop: 20 }]} 
              onPress={() => {}}
            >
              <Text style={styles.modalOption}>Adicionar ao post principal</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      </View>
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

  buttomAddPost: {
    justifyContent: 'center',
    width: 180,
    height: 100,
    alignItems: 'center',
    backgroundColor: '#222',
    borderRadius: 20,
  },

  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalOption: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    width: 200,
    textAlign: 'center',
    color:'#FF8C00',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonEditPost:{
    position: 'absolute',
    bottom: 20, 
    flexDirection: 'row',
    width: 115,
    height: 50,
    alignItems: 'center',
    backgroundColor: '#FF8C00',
    padding: 10,
    borderRadius: 20,
  },
});

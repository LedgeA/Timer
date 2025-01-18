import React, { 
  useState, 
  useEffect 
} from 'react';

import { 
  View, 
  Text, 
  StyleSheet, 
  Button, 
  TextInput, 
  TouchableOpacity
} from 'react-native';

import { useFonts } from 'expo-font';
import { Audio } from 'expo-av';

const primaryColor = '#002147';
const secondaryColor = '#FFFFFF';

const App = () => {

  const [loaded, error] = useFonts({
    'Georama-Regular': require('./assets/fonts/Georama-Regular.ttf'),
    'Georama-Medium': require('./assets/fonts/Georama-Medium.ttf'),
    'Georama-Bold' : require('./assets/fonts/Georama-Bold.ttf'),
  });

  const [prep, setPrep] = useState('00:00:00');
  const [roundInterval, setRoundInterval]= useState('00:00:00');
  const [rounds, setRounds] = useState(1);
  const [roundInput, setRoundInput] = useState('1');

  const [start, setStart] = useState(false);
  const [isRunning, setIsRunning] = useState(true);
  const [prepStatus, setPrepStatus] = useState(true);
  const [isFinalRound, setIsFinalRound] = useState(false);
  const [currentRounds, setCurrentRounds] = useState(1);

  const [milliseconds, setMilliseconds] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [hours, setHours] = useState(0);

  var timeModel = {
    seconds: 0,
    minutes: 0, 
    hours: 0
  }

  const [sound, setSound] = useState();
  
  const sounds = {
    start: require('./assets/sounds/start.wav'),
    pause: require('./assets/sounds/pause.wav'),
    resume: require('./assets/sounds/resume.wav'),
    end: require('./assets/sounds/end.wav')
  };

  async function playSound(songName) {
    if (!sounds[songName]) {
      console.log(`Sound "${songName}" not found`);
      return;
    }

    console.log('Loading Sound', songName);
    const { sound } = await Audio.Sound.createAsync(sounds[songName]);
    setSound(sound);

    console.log('Playing Sound', songName);
    await sound.playAsync();
  }

  useEffect(() => {
    return sound
      ? () => {
          console.log('Unloading Sound');
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);
  const startTimer = () => {

    setPrep(prep.trim());
    setRoundInterval(roundInterval.trim());
    
    console.log('----------------------------------');

    if (isNaN(roundInput.trim())) return;

    if (roundInput < 1) return;
    
    setRounds(parseInt(roundInput.trim()));

    timeModel = {
      seconds: parseInt(prep.substring(prep.length - 2)),
      minutes: parseInt(prep.substring(3, 5)),
      hours: parseInt(prep.substring(0, 2)),
    };

    console.log('Prep: ');
    console.log(timeModel);

    if (timeModel.seconds != prep.substring(prep.length - 2) ||
        timeModel.minutes != prep.substring(3, 5) ||
        timeModel.hours != prep.substring(0, 2)) return;
      
    timeModel = {
      seconds: parseInt(roundInterval.substring(roundInterval.length - 2)),
      minutes: parseInt(roundInterval.substring(3, 5)),
      hours: parseInt(roundInterval.substring(0, 2)),
    };

    console.log('Round Interval: ');
    console.log(timeModel);

    if (timeModel.seconds == 0 &&
        timeModel.minutes == 0 &&
        timeModel.hours == 0) return;

    if (timeModel.seconds != roundInterval.substring(roundInterval.length - 2) ||
        timeModel.minutes != roundInterval.substring(3, 5) ||
        timeModel.hours != roundInterval.substring(0, 2)) return;
    
    setStart(true);
  }
  

  useEffect(() => {

    const resetCount = () => {
      setMilliseconds(0);
      setSeconds(0);
      setMinutes(0);
      setHours(0);
    }

    if (!start) {
      resetCount();
      setIsRunning(true);
      setPrepStatus(true); 
      setIsFinalRound(false);
      setCurrentRounds(1);
      return; 
    }

    const prepTimeModel = {
      seconds: parseInt(prep.substring(prep.length - 2)),
      minutes: parseInt(prep.substring(3, 5)),
      hours: parseInt(prep.substring(0, 2))
    }

    const roundIntervalTimeModel = {
      seconds: parseInt(roundInterval.substring(roundInterval.length - 2)),
      minutes: parseInt(roundInterval.substring(3, 5)),
      hours: parseInt(roundInterval.substring(0, 2))
    }

    console.log('Time Models: ');

    console.log(prepTimeModel);
    console.log(roundIntervalTimeModel);

    if (!prepStatus) {
      const interval = setInterval(() => {
        if (!isRunning) return;
  
        if (isFinalRound) {
          console.log('reached');
          return;
        }
  
        setMilliseconds((prevMilliseconds) => {
          if (prevMilliseconds === 99) {
            setMilliseconds(0);
            setSeconds((prevSeconds) => {
              if (prevSeconds === 59) {
                setSeconds(0);
                setMinutes((prevMinutes) => {
                  if (prevMinutes === 59) {
                    setMinutes(0);
                    setHours((prevHours) => prevHours + 1);
                  } else {
                    return prevMinutes + 1;
                  }
                });
              } else { 
                return prevSeconds + 1;
              } 
            });
          }
  
          setSeconds((prevSeconds) => {
            setMinutes((prevMinutes) => {
              setHours((prevHours) => {
                if (prevSeconds == roundIntervalTimeModel.seconds &&
                    prevMinutes == roundIntervalTimeModel.minutes &&
                    prevHours == roundIntervalTimeModel.hours) 
                {
                  if (currentRounds != rounds) {
                    resetCount();
                    setCurrentRounds((prevCurrentRounds) => {
                      return prevCurrentRounds + 1;
                      }
                    );
                  }
                  if (currentRounds == rounds) {
                    setIsFinalRound(true);
                    console.log(isFinalRound);
                  };
                }
                return prevHours;
              });
              return prevMinutes;
            });
            return prevSeconds;
          });
          return prevMilliseconds + 1;
        });
      }, 10);
       
      return () => clearInterval(interval);
    } else {
      const interval = setInterval(() => {
        if (!isRunning) return;
        
        setMilliseconds((prevMilliseconds) => {
          if (prevMilliseconds === 99) {
            setMilliseconds(0);
            setSeconds((prevSeconds) => {
              if (prevSeconds === 59) {
                setSeconds(0);
                setMinutes((prevMinutes) => {
                  if (prevMinutes === 59) {
                    setMinutes(0);
                    setHours((prevHours) => prevHours + 1);
                  } else {
                    return prevMinutes + 1;
                  }
                });
              } else { 
                return prevSeconds + 1;
              } 
            });
          }
  
          setSeconds((prevSeconds) => {
            setMinutes((prevMinutes) => {
              setHours((prevHours) => {
                if (prevSeconds == prepTimeModel.seconds &&
                    prevMinutes == prepTimeModel.minutes &&
                    prevHours == prepTimeModel.hours
                ) {
                  resetCount();
                  setPrepStatus(false);
                }
                return prevHours;
              });
              return prevMinutes;
            });
            return prevSeconds;
          });
          return prevMilliseconds + 1;
        });
      }, 10);
      
      return () => clearInterval(interval);
    }
  
    
  }, [start, isRunning, currentRounds, prepStatus, isFinalRound]);

  return (
    <View style={styles.background}>
      <View style={{height: '10%'}}></View>
      { !start ? (
        <>
          <View style={styles.form}>
            <Text style={styles.label}>Prep</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                onChangeText={setPrep}
                value={prep}
                keyboardType="numeric"
              />
            </View>
          </View>
          <View style={styles.form}>
            <Text style={styles.label}>Interval</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                onChangeText={setRoundInterval}
                value={roundInterval}
                keyboardType="numeric"
              />
            </View>
          </View>
          <View style={styles.roundsContainer}>
            <View style={styles.roundsRow}>
              <Text style={styles.roundsLabel}>Rounds</Text>
            </View>

            <TextInput
              style={[styles.roundsRow, styles.roundsInput]}
              onChangeText={setRoundInput}
              value={roundInput}
              keyboardType="numeric"
            />
    
          </View>
          <TouchableOpacity style={styles.startContainer} onPress={()=> { startTimer(); playSound('start') }}>
            <Text style={styles.startLabel}>Start!</Text>
          </TouchableOpacity>
          </>
        ) : (
          <>
            <View style={styles.timerContainer}>
              <Text style={styles.timerLabel}>
                {`${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}:${String(milliseconds).padStart(2, "0")}`} 
              </Text>
              <Text style={styles.roundsLeftLabel}>{(!prepStatus) ? currentRounds + '/' + rounds : 'Prep'}</Text>
            </View>
            <View style={styles.optionsRow}>
              <TouchableOpacity style={styles.optionsContainer} onPress={() => { setIsRunning(!isRunning); (isRunning) ? playSound('pause'): playSound('resume'); }}>
                <Text style={styles.optionsLabel}>{(isRunning ? 'Pause' : 'Resume')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.optionsContainer} onPress={() => { setStart(false); playSound('end'); }}>
                <Text style={styles.optionsLabel}>End</Text>
              </TouchableOpacity>
            </View>
          </>
        )
      }
    </View>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: primaryColor,
    alignItems: 'center'
  },

  form: {
    height: '7%',
    width: '75%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },

  label: {
    color: secondaryColor,
    fontSize: 16,
    fontFamily: 'Georama-Medium'
  },

  inputContainer: {
    backgroundColor: secondaryColor,
    height: '81%',
    width: '50%',
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center'
  },
  
  input: {
    color: primaryColor,
    width: 'auto',
    textAlign: 'center',
    fontSize: 18,
    fontFamily: 'Georama-Medium'
  },

  roundsContainer: {
    backgroundColor: secondaryColor,
    height: '17%',
    width: '80%',
    borderRadius: 20,
    marginVertical: 30,
    marginBottom: 50,
    flexDirection: 'row',
  },

  roundsLabel: {
    color: primaryColor,
    fontSize: 23,
    fontFamily: 'Georama-Regular'
  },

  roundsInput: {
    color: primaryColor,
    textAlign: "center",
    fontSize: 25,
    fontFamily: 'Georama-Bold'
  },

  roundsRow: {
    height: 'auto',
    width: '50%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  roundsNumber: {
    color: primaryColor,
    fontSize: 25,
    fontFamily: 'Georama-Bold'
  },

  startContainer: {
    borderColor: secondaryColor,
    borderWidth: 2,
    height: '25%',
    width: '80%',
    marginTop: 50,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  startLabel: {
    color: secondaryColor,
    fontSize: 30,
    fontFamily: 'Georama-Bold'
  },

  timerContainer: {
    backgroundColor: secondaryColor,
    height: '30%',
    width: '80%',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  timerLabel: {
    color: primaryColor,
    fontSize: 30,
    fontFamily: 'Georama-Bold'

  },

  roundsLeftLabel: {
    position: 'absolute',
    transform: [{ translateY: +100 }],
    color: primaryColor,
    marginTop: 10,
    marginBottom: 20,
    fontSize: 17,
    fontFamily: 'Georama-Bold'
  },

  optionsRow: {
    height: '6%',
    width: '80%',
    marginTop: 30,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },

  optionsContainer: {
    backgroundColor: secondaryColor,
    height: 'auto',
    width: '35%',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  optionsLabel: {
    color: primaryColor,
    fontSize: 17,
    fontFamily: 'Georama-Medium'
  }

});

export default App;

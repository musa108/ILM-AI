import { useColorScheme } from '@/components/useColorScheme'
import Colors from '@/constants/Colors'
import { ALL_QUESTIONS } from '@/data/questions'
import { FontAwesome5 } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import React, { useState } from 'react'
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import Animated, { FadeInDown, LinearTransition } from 'react-native-reanimated'
import { SafeAreaView } from 'react-native-safe-area-context'

const shuffleQuestions = (count: number) => {
    return [...ALL_QUESTIONS]
        .sort(() => Math.random() - 0.5)
        .slice(0, count)
}

export default function Quiz() {
    const { width } = Dimensions.get('window')
    const [quizQuestions, setQuizQuestions] = useState(() => shuffleQuestions(10))
    const [currentQuestion, setCurrentQuestion] = useState(0)
    const [score, setScore] = useState(0)
    const [showScore, setShowScore] = useState(false)
    const [selectedOption, setSelectedOption] = useState<number | null>(null)
    const colorScheme = useColorScheme() ?? 'light'
    const currentColors = Colors[colorScheme]

    const handleAnswer = (index: number) => {
        setSelectedOption(index)

        setTimeout(() => {
            if (index === quizQuestions[currentQuestion].answer) {
                setScore(score + 1)
            }

            const nextQuestion = currentQuestion + 1
            if (nextQuestion < quizQuestions.length) {
                setCurrentQuestion(nextQuestion)
                setSelectedOption(null)
            } else {
                setShowScore(true)
            }
        }, 600)
    }

    const resetQuiz = () => {
        setQuizQuestions(shuffleQuestions(10))
        setCurrentQuestion(0)
        setScore(0)
        setShowScore(false)
        setSelectedOption(null)
    }

    const progress = (currentQuestion + 1) / quizQuestions.length

    if (showScore) {
        return (
            <View style={[styles.container, { backgroundColor: currentColors.background }]}>
                <LinearGradient
                    colors={[currentColors.tint + '20', 'transparent']}
                    style={StyleSheet.absoluteFill}
                />
                <Animated.View
                    entering={FadeInDown.duration(800)}
                    style={styles.scoreContainer}
                >
                    <FontAwesome5 name="trophy" size={100} color={currentColors.accent} />
                    <Text style={[styles.scoreTitle, { color: currentColors.text }]}>MashaAllah!</Text>
                    <Text style={[styles.scoreText, { color: currentColors.text + '80' }]}>
                        You completed the quiz with a score of
                    </Text>
                    <View style={[styles.scoreBadge, { backgroundColor: currentColors.tint }]}>
                        <Text style={styles.scoreBadgeText}>{score} / {quizQuestions.length}</Text>
                    </View>
                    <TouchableOpacity
                        style={[styles.primaryButton, { backgroundColor: currentColors.tint }]}
                        onPress={resetQuiz}
                    >
                        <Text style={styles.buttonText}>Try Again</Text>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        )
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: currentColors.background }]}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Text style={[styles.headerTitle, { color: currentColors.text }]}>Knowledge Test</Text>
                    <View style={[styles.progressBarBg, { backgroundColor: currentColors.secondary }]}>
                        <Animated.View
                            layout={LinearTransition}
                            style={[
                                styles.progressBar,
                                { backgroundColor: currentColors.tint, width: `${progress * 100}%` }
                            ]}
                        />
                    </View>
                    <Text style={[styles.questionCount, { color: currentColors.text + '60' }]}>
                        Question {currentQuestion + 1} of {quizQuestions.length}
                    </Text>
                </View>

                <Animated.View
                    key={currentQuestion}
                    entering={FadeInDown.duration(600)}
                    style={[styles.questionCard, { backgroundColor: currentColors.secondary + '40' }]}
                >
                    <Text style={[styles.questionText, { color: currentColors.text }]}>
                        {quizQuestions[currentQuestion].question}
                    </Text>
                </Animated.View>

                <View style={styles.optionsContainer}>
                    {quizQuestions[currentQuestion].options.map((option, index) => {
                        const isSelected = selectedOption === index
                        const isCorrect = isSelected && index === quizQuestions[currentQuestion].answer

                        return (
                            <TouchableOpacity
                                key={index}
                                activeOpacity={0.8}
                                style={[
                                    styles.optionButton,
                                    { backgroundColor: currentColors.background, borderColor: currentColors.secondary },
                                    isSelected && (isCorrect ? { borderColor: '#27ae60', backgroundColor: '#e8f5e9' } : { borderColor: '#e74c3c', backgroundColor: '#fdeaea' })
                                ]}
                                onPress={() => handleAnswer(index)}
                                disabled={selectedOption !== null}
                            >
                                <Text style={[
                                    styles.optionText,
                                    { color: currentColors.text },
                                    isSelected && (isCorrect ? { color: '#27ae60' } : { color: '#e74c3c' })
                                ]}>
                                    {option}
                                </Text>
                                {isSelected && (
                                    <FontAwesome5
                                        name={isCorrect ? "check-circle" : "times-circle"}
                                        size={20}
                                        color={isCorrect ? "#27ae60" : "#e74c3c"}
                                    />
                                )}
                            </TouchableOpacity>
                        )
                    })}
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: 25,
    },
    header: {
        marginBottom: 40,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    progressBarBg: {
        height: 8,
        borderRadius: 4,
        width: '100%',
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        borderRadius: 4,
    },
    questionCount: {
        marginTop: 10,
        fontSize: 14,
        fontWeight: '600',
    },
    questionCard: {
        padding: 30,
        borderRadius: 25,
        marginBottom: 40,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    questionText: {
        fontSize: 22,
        lineHeight: 32,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    optionsContainer: {
        gap: 15,
    },
    optionButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderRadius: 18,
        borderWidth: 2,
    },
    optionText: {
        fontSize: 17,
        fontWeight: '600',
    },
    scoreContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 30,
    },
    scoreTitle: {
        fontSize: 36,
        fontWeight: 'bold',
        marginTop: 25,
    },
    scoreText: {
        fontSize: 18,
        marginTop: 10,
        textAlign: 'center',
    },
    scoreBadge: {
        paddingHorizontal: 30,
        paddingVertical: 15,
        borderRadius: 25,
        marginVertical: 30,
    },
    scoreBadgeText: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
    },
    primaryButton: {
        width: '100%',
        height: 60,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
})

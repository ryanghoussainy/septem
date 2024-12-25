import { ScrollView, StyleSheet, View, Text } from 'react-native';
import { colours, masteryColours } from '../constants/colours';

const PUSHUPS_MAX = 20;
const dummyGoals = [
    {
        id: 1,
        name: "Pushups",
        mastery: 1,
        target_value: 20,
        achieved_value: PUSHUPS_MAX,
        is_stretch: false,
    },
    {
        id: 2,
        name: "Pushups",
        mastery: 2,
        target_value: 40,
        achieved_value: PUSHUPS_MAX,
        is_stretch: false,
    },
    {
        id: 3,
        name: "Pushups",
        mastery: 3,
        target_value: 60,
        achieved_value: PUSHUPS_MAX,
        is_stretch: false,
    },
    {
        id: 4,
        name: "Pushups",
        mastery: 4,
        target_value: 80,
        achieved_value: PUSHUPS_MAX,
        is_stretch: false,
    },
    {
        id: 5,
        name: "Pushups",
        mastery: 5,
        target_value: 100,
        achieved_value: PUSHUPS_MAX,
        is_stretch: false,
    },
    {
        id: 6,
        name: "Pushups",
        mastery: 6,
        target_value: 150,
        achieved_value: PUSHUPS_MAX,
        is_stretch: false,
    },
    {
        id: 7,
        name: "Pushups",
        mastery: 7,
        target_value: 200,
        achieved_value: PUSHUPS_MAX,
        is_stretch: false,
    },
    {
        id: 15,
        name: "Pull ups",
        mastery: 1,
        target_value: 10,
        achieved_value: 12,
        is_stretch: false,
    },
    {
        id: 16,
        name: "Pull ups",
        mastery: 2,
        target_value: 15,
        achieved_value: 12,
        is_stretch: false,
    },
    {
        id: 17,
        name: "Pull ups",
        mastery: 3,
        target_value: 20,
        achieved_value: 12,
        is_stretch: false,
    },
    {
        id: 18,
        name: "Pull ups",
        mastery: 4,
        target_value: 30,
        achieved_value: 12,
        is_stretch: false,
    },
    {
        id: 19,
        name: "Pull ups",
        mastery: 5,
        target_value: 40,
        achieved_value: 12,
        is_stretch: false,
    },
    {
        id: 20,
        name: "Pull ups",
        mastery: 6,
        target_value: 50,
        achieved_value: 12,
        is_stretch: false,
    },
    {
        id: 21,
        name: "Pull ups",
        mastery: 7,
        target_value: 70,
        achieved_value: 12,
        is_stretch: false,
    },
    {
        id: 8,
        name: "The Splits",
        mastery: 1,
        target_value: 1,
        achieved_value: 0,
        is_stretch: true,
    },
];

const groupBySkill = (data) => {
    const grouped = data.reduce((acc, curr) => {
        if (!acc[curr.name]) {
            acc[curr.name] = [];
        }
        acc[curr.name].push(curr);
        return acc;
    }, {});

    // Sort each skill's goals by mastery
    for (const skill in grouped) {
        grouped[skill].sort((a, b) => a.mastery - b.mastery);
    }

    // Sort skills by number of completed goals
    const sortedGrouped = Object.entries(grouped).sort((a, b) => {
        const aCompleted = a[1].filter(goal => goal.achieved_value >= goal.target_value).length;
        const bCompleted = b[1].filter(goal => goal.achieved_value >= goal.target_value).length;
        return bCompleted - aCompleted;
    });

    return sortedGrouped;
};

const ProgressBar = ({ skill, goals }) => {
    const achievedValue = goals[0].achieved_value;
    const highestAchievedGoal = goals.filter(goal => goal.target_value <= achievedValue).pop();
    const lowestNonAchievedGoal = goals.find(goal => goal.target_value > achievedValue);

    let progress = 0;
    let progressColor = colours.cardBG;
    let startValue = 0;
    let endValue = 0;
    const isStretch = goals[0].is_stretch;

    if (!highestAchievedGoal) {
        // Case 1: Achieved value is between 0 and the first target
        startValue = 0;
        endValue = goals[0].target_value;
        progress = (achievedValue / endValue) * 100;
        progressColor = colours.darkgrey;
    } else if (!lowestNonAchievedGoal) {
        // Case 2: Achieved value is greater or equal to the highest target
        startValue = highestAchievedGoal.target_value;
        endValue = highestAchievedGoal.target_value;
        progress = 100;
        progressColor = masteryColours[highestAchievedGoal.mastery];
    } else {
        // Case 3: Achieved value is between two targets
        startValue = highestAchievedGoal.target_value;
        endValue = lowestNonAchievedGoal.target_value;
        progress = ((achievedValue - startValue) / (endValue - startValue)) * 100;
        progressColor = masteryColours[highestAchievedGoal.mastery];
    }

    // Adjust progress bar for a minimum of 1% width
    progress = Math.max(progress, 1);

    return (
        <View style={styles.progressBarContainer}>
            <Text style={styles.skillTitle}>{skill}</Text>
            <Text style={[styles.progressText, { left: `${progress}%`, color: progressColor }]}>{isStretch ? "" : achievedValue}</Text>
            <View style={styles.progressBar}>
                <View style={[styles.progress, { width: `${progress}%`, backgroundColor: progressColor }]} />
            </View>
            <View style={styles.progressBarLabels}>
                <Text>{isStretch ? "Not Completed" : startValue}</Text>
                <Text>{isStretch ? "Completed" : endValue}</Text>
            </View>
        </View>
    );
};

const Goals = () => {
    const groupedGoals = groupBySkill(dummyGoals);

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollView}>
                {groupedGoals.map(([skill, goals]) => (
                    <ProgressBar key={skill} skill={skill} goals={goals} />
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colours.bg,
        paddingTop: 40,
    },
    scrollView: {
        flexGrow: 1,
        padding: 16,
    },
    progressBarContainer: {
        marginBottom: 10,
        backgroundColor: colours.cardBG,
        padding: 16,
        borderRadius: 8,
        elevation: 2,
    },
    skillTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        color: colours.text,
    },
    progressBar: {
        height: 20,
        backgroundColor: colours.cardBG,
        borderRadius: 10,
        overflow: 'hidden',
        position: 'relative',
        borderWidth: StyleSheet.hairlineWidth,
        elevation: 4,
    },
    progress: {
        height: '100%',
    },
    progressText: {
        fontWeight: 'bold',
        marginBottom: 5,
        transform: [{ translateX: -10 }],
    },
    progressBarLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 5,
    },
});

export default Goals;

import { Alert } from "react-native";
import { supabase } from "../../lib/supabase";

export const getMaxAchievedValue = (activities) => {
    let out = activities[0].achieved_value;
    for (let i = 1; i < activities.length; i++) {
        if (activities[i].achieved_value > out) {
            out = activities[i].achieved_value;
        }
    }
    return out;
  };

export const groupGoalsBySkillId = (data, achievedValues) => {    
  const grouped = data.reduce((acc, curr) => {
    const skillId = curr.skill_id;
    if (!acc[skillId]) {
      acc[skillId] = { goals: [], achievedCount: 0 };
    }
    acc[skillId].goals.push(curr);
    if ((achievedValues[skillId] ? getMaxAchievedValue(achievedValues[skillId]) : 0) >= curr.target_value) {
      acc[skillId].achievedCount += 1;
    }
    return acc;
  }, {});

  // Sort each skill by mastery
  for (const skill in grouped) {
      grouped[skill].goals.sort((a, b) => a.mastery - b.mastery);
  }
    
  // Sort the skills by the number of achievements achieved
  const sortedGrouped = Object.entries(grouped).sort(
    (a, b) => b[1].achievedCount - a[1].achievedCount
  );

  return sortedGrouped;
};

export const fetchGoals = async () => {
    try {
        const { data, error } = await supabase
            .from('goals')
            .select('*');
        
        if (error) {
            Alert.alert(error.message);
            return;
        }
    
        return data;
        
    } catch (error) {
        Alert.alert(error.message);
    }
}

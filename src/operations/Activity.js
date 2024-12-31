import { Alert } from "react-native";
import { supabase } from "../../lib/supabase";


export const groupActivityBySkillId = (data) => {
    const grouped = data.reduce((acc, curr) => {
      const skillId = curr.skill_id;
      if (!acc[skillId]) {
        acc[skillId] = [];
      }
      acc[skillId].push(curr);
      return acc;
    }, {});
  
    // Sort each skill by time
    for (const skill in grouped) {
      grouped[skill].sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
    }
  
    return grouped;
};

export const fetchUserActivity = async (
    userId,
) => {
    try {
        const { data, error } = await supabase
            .from('activity')
            .select('*')
            .eq('user_id', userId);
        
        if (error) {
            Alert.alert(error.message);
            return;
        }
    
        return data;
        
    } catch (error) {
        Alert.alert(error.message);
    }
}

export const logActivity = async (
    userId,
    skillId,
    value,
) => {
    try {
        const { error } = await supabase
            .from('activity')
            .insert([
                {
                    user_id: userId,
                    skill_id: skillId,
                    achieved_value: value,
                }
            ]);
        
        if (error) {
            consele.log(error.message);
            Alert.alert(error.message);
            return;
        }
    
        return;
        
    } catch (error) {
        Alert.alert(error.message);
    }
}

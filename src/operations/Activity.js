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
            Alert.alert(error.message);
            return false;
        }
    
        return true;
        
    } catch (error) {
        Alert.alert(error.message);
    }
}

export const deleteMostRecentActivity = async (
    userId,
    skillId,
) => {
    try {
        const { data, error } = await supabase
            .from('activity')
            .delete()
            .select('id')
            .eq('user_id', userId)
            .eq('skill_id', skillId)
            .order('created_at', { ascending: false })
            .limit(1);

        if (error) {
            Alert.alert('Error retrieving or deleting activity:', error.message);
            return;
        }

        if (data.length === 0) {
            Alert.alert('No activity found to delete.');
            return;
        }

        Alert.alert('Activity deleted successfully.');
    } catch (err) {
        Alert.alert('Unexpected error occurred:', err.message);
    }
};


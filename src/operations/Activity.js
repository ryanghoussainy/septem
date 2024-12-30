import { Alert } from "react-native";
import { supabase } from "../../lib/supabase";


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

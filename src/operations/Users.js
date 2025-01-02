import { Alert } from "react-native";
import { supabase } from "../../lib/supabase";


export const fetchUser = async (
    userId,
) => {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();
        
        if (error) {
            Alert.alert(error.message);
            return;
        }
    
        return data;
        
    } catch (error) {
        Alert.alert(error.message);
    }
}

export const updateUser = async (
    userId,
    values,
) => {
    try {
        const { error } = await supabase
            .from('users')
            .update(values)
            .eq('id', userId);
        
        if (error) {
            Alert.alert(error.message);
            return;
        }
    
    } catch (error) {
        Alert.alert(error.message);
    }
}

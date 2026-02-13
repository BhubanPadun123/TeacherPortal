import { BACKEND_BASE_URL, service_path } from '@/utils/apiUtils';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type ConfigState = {
  backendBaseUrl: string;
  servicePath: Record<string, string>;
};

const initialState: ConfigState = {
  backendBaseUrl: BACKEND_BASE_URL,
  servicePath: service_path,
};

const configSlice = createSlice({
  name: 'config',
  initialState,
  reducers: {
    setBackendBaseUrl(state, action: PayloadAction<string>) {
      state.backendBaseUrl = action.payload;
    },
    setServicePath(state, action: PayloadAction<Record<string, string>>) {
      state.servicePath = action.payload;
    },
    setServicePathEntry(state, action: PayloadAction<{ key: string; path: string }>) {
      const { key, path } = action.payload;
      state.servicePath[key] = path;
    },
  },
});

export const { setBackendBaseUrl, setServicePath, setServicePathEntry } = configSlice.actions;
export default configSlice.reducer;

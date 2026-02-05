import React, { useState } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Paper,
} from '@mui/material';
import {
  Edit as ManualIcon,
  Quiz as QuizIcon,
} from '@mui/icons-material';
import CreateQuizManual from './CreateQuizManual';
import CreateQuizFromQuestions from './CreateQuizFromQuestions';


interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`create-quiz-tabpanel-${index}`}
      aria-labelledby={`create-quiz-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const CreateQuiz: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box>
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="create quiz tabs"
          variant="fullWidth"
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <Tab
            icon={<ManualIcon />}
            iconPosition="start"
            label="Crea tus propias preguntas"
            id="create-quiz-tab-0"
            aria-controls="create-quiz-tabpanel-0"
          />
          <Tab
            icon={<QuizIcon />}
            iconPosition="start"
            label="Escoge preguntas hechas"
            id="create-quiz-tab-1"
            aria-controls="create-quiz-tabpanel-1"
          />
        </Tabs>
      </Paper>

      <TabPanel value={tabValue} index={0}>
        <CreateQuizManual />
      </TabPanel>
      <TabPanel value={tabValue} index={1}>
        <CreateQuizFromQuestions />
      </TabPanel>
    </Box>
  );
};

export default CreateQuiz;

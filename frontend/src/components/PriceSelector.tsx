import React from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  Chip,
} from '@mui/material';
import { AttachMoney as MoneyIcon } from '@mui/icons-material';

export const PRICE_OPTIONS = [5, 7, 10, 13, 20, 50, 100];

interface PriceSelectorProps {
  value: number | null;
  onChange: (price: number | null) => void;
  label?: string;
}

const PriceSelector: React.FC<PriceSelectorProps> = ({ 
  value, 
  onChange, 
  label = 'Precio para desbloquear respuestas' 
}) => {
  return (
    <FormControl fullWidth>
      <InputLabel>{label}</InputLabel>
      <Select
        value={value === null ? '' : String(value)}
        onChange={(e) => {
          const val = e.target.value;
          onChange(val === '' || val === null ? null : Number(val));
        }}
        label={label}
        startAdornment={
          value !== null && (
            <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
              <MoneyIcon sx={{ color: 'primary.main', mr: 0.5 }} />
            </Box>
          )
        }
      >
        <MenuItem value="">
          <em>Gratis (sin bloqueo)</em>
        </MenuItem>
        {PRICE_OPTIONS.map((price) => (
          <MenuItem key={price} value={price}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <MoneyIcon sx={{ fontSize: 18, color: 'primary.main' }} />
              <Typography fontWeight={600}>${price}</Typography>
              <Chip 
                label={price <= 10 ? 'Popular' : price >= 50 ? 'Premium' : ''} 
                size="small" 
                color={price <= 10 ? 'primary' : price >= 50 ? 'secondary' : 'default'}
                sx={{ height: 20, fontSize: '0.7rem' }}
              />
            </Box>
          </MenuItem>
        ))}
      </Select>
      {value !== null && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
          Los seguidores deberán pagar ${value} para ver tus respuestas
        </Typography>
      )}
    </FormControl>
  );
};

export default PriceSelector;

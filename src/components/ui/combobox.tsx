
import * as React from "react";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { forwardRef } from "react";

export interface ComboboxOption {
  label: string;
  value: string;
}

interface ComboboxProps {
  options: ComboboxOption[];
  value: string;
  onSelect: (value: string) => void;
  placeholder?: string;
  className?: string;
  allowCustomValue?: boolean;
  emptyMessage?: string;
  name?: string;
  id?: string;
  disabled?: boolean;
  onInputChange?: (value: string) => void;
}

const Combobox = forwardRef<HTMLInputElement, ComboboxProps>(
  ({ 
    options,
    value,
    onSelect,
    placeholder = "Selecione uma opção",
    className,
    allowCustomValue = false,
    emptyMessage = "Nenhum item encontrado.",
    name,
    id,
    disabled = false,
    onInputChange
  }, ref) => {
    const [open, setOpen] = React.useState(false);
    const [searchValue, setSearchValue] = React.useState("");

    // Função para manipular a seleção de uma opção
    const handleSelect = React.useCallback((selectedValue: string) => {
      onSelect(selectedValue);
      setOpen(false);
      setSearchValue(""); // Limpar o campo de busca após selecionar
    }, [onSelect]);

    // Função para lidar com mudanças no input
    const handleInputChange = React.useCallback((inputValue: string) => {
      setSearchValue(inputValue);
      if (onInputChange) {
        onInputChange(inputValue);
      }
      if (allowCustomValue) {
        onSelect(inputValue);
      }
    }, [allowCustomValue, onSelect, onInputChange]);

    // Encontra a label para o valor atual
    const selectedOptionLabel = React.useMemo(() => {
      const selectedOption = options.find(option => option.value === value);
      return selectedOption ? selectedOption.label : value;
    }, [options, value]);

    // Filtramos as opções aqui para melhorar a busca
    const filteredOptions = React.useMemo(() => {
      if (!searchValue.trim()) return options;
      
      const normalizedSearch = searchValue.trim().toLowerCase();
      return options.filter(option => 
        option.label.toLowerCase().includes(normalizedSearch)
      );
    }, [options, searchValue]);

    return (
      <div className={cn("relative", className)}>
        <input
          type="hidden"
          ref={ref}
          name={name}
          id={id}
          value={value}
        />
        <Popover open={disabled ? false : open} onOpenChange={disabled ? undefined : setOpen}>
          <PopoverTrigger asChild disabled={disabled}>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className={cn(
                "w-full justify-between",
                disabled && "opacity-50 cursor-not-allowed"
              )}
              disabled={disabled}
            >
              {value ? selectedOptionLabel : placeholder}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
            <Command shouldFilter={false}> {/* Desativamos o filtro interno para controlar manualmente */}
              <CommandInput 
                placeholder={placeholder}
                value={searchValue}
                onValueChange={handleInputChange}
              />
              <CommandList>
                <CommandEmpty>{emptyMessage}</CommandEmpty>
                <CommandGroup>
                  {filteredOptions.map((option) => (
                    <CommandItem
                      key={option.value}
                      value={option.value}
                      onSelect={() => handleSelect(option.value)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === option.value ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {option.label}
                    </CommandItem>
                  ))}
                  {allowCustomValue && searchValue && !filteredOptions.some(o => o.label.toLowerCase() === searchValue.toLowerCase()) && (
                    <CommandItem onSelect={() => handleSelect(searchValue)}>
                      Adicionar "{searchValue}"
                    </CommandItem>
                  )}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    );
  }
);

Combobox.displayName = "Combobox";

export { Combobox };

import win32com.client
import re

# Define valuation logic based on MAGERIT methodology
# D=Disponibilidad, I=Integridad, C=Confidencialidad, A=Autenticidad, NR=No Repudio

def get_asset_values(asset_name):
    """Assign base values for each asset type based on its nature"""
    asset_values = {
        # Information Assets (Datos)
        "Multimedia": {"D": 6, "I": 6, "C": 3, "A": 6, "NR": 4},
        "Datos de gestión interna": {"D": 7, "I": 8, "C": 7, "A": 7, "NR": 6},
        "Datos de las certificaciones": {"D": 8, "I": 9, "C": 8, "A": 9, "NR": 8},
        "Documentos": {"D": 7, "I": 8, "C": 6, "A": 7, "NR": 6},
        "Informes": {"D": 6, "I": 8, "C": 7, "A": 8, "NR": 7},
        "Respaldos Backup - Expedientes": {"D": 9, "I": 9, "C": 8, "A": 8, "NR": 7},
        "Trámites": {"D": 8, "I": 9, "C": 7, "A": 9, "NR": 8},
        "Información pública": {"D": 5, "I": 6, "C": 2, "A": 7, "NR": 5},
        "Información personal": {"D": 7, "I": 9, "C": 9, "A": 9, "NR": 8},
        "Información restringida": {"D": 8, "I": 9, "C": 10, "A": 9, "NR": 9},
        "Registro de datos de entrada": {"D": 7, "I": 8, "C": 6, "A": 8, "NR": 7},
        
        # Services (Servicios)
        "Servicio de Internet": {"D": 9, "I": 6, "C": 5, "A": 5, "NR": 4},
        "Correo electrónico entidad": {"D": 8, "I": 7, "C": 7, "A": 7, "NR": 6},
        
        # Physical Assets (Instalaciones)
        "Oficinas": {"D": 7, "I": 5, "C": 4, "A": 4, "NR": 3},
        "Sala de orientaciones - Capacitaciones": {"D": 6, "I": 4, "C": 3, "A": 4, "NR": 3},
        "Sala de atención": {"D": 7, "I": 5, "C": 4, "A": 4, "NR": 3},
    }
    return asset_values.get(asset_name, {"D": 5, "I": 5, "C": 5, "A": 5, "NR": 5})

def get_threat_impact(threat_code, threat_name, asset_values):
    """Calculate threat impact based on threat type and asset characteristics"""
    # Default values (will be modified based on threat type)
    values = {"D": 5, "I": 5, "C": 5, "A": 5, "NR": 5}
    
    threat_lower = threat_name.lower()
    
    # Natural Disasters (N.*)
    if threat_code.startswith("N.") or "fuego" in threat_lower or "agua" in threat_lower or "desastre" in threat_lower:
        values["D"] = min(10, asset_values["D"] + 2)  # High availability impact
        values["I"] = min(10, asset_values["I"] + 1)  # Moderate integrity impact
        values["C"] = max(1, asset_values["C"] - 2)   # Low confidentiality impact
        values["A"] = max(1, asset_values["A"] - 2)   # Low authenticity impact
        values["NR"] = max(1, asset_values["NR"] - 2) # Low non-repudiation impact
    
    # Industrial Accidents (I.*)
    elif threat_code.startswith("I."):
        values["D"] = min(10, asset_values["D"] + 1)
        values["I"] = asset_values["I"]
        values["C"] = max(1, asset_values["C"] - 1)
        values["A"] = max(1, asset_values["A"] - 1)
        values["NR"] = max(1, asset_values["NR"] - 1)
    
    # Errors and Failures (F.*)
    elif threat_code.startswith("F") or "error" in threat_lower or "fallo" in threat_lower:
        if "destrucción" in threat_lower or "destruccion" in threat_lower:
            values["D"] = min(10, asset_values["D"] + 3)
            values["I"] = min(10, asset_values["I"] + 3)
            values["C"] = asset_values["C"]
            values["A"] = asset_values["A"]
            values["NR"] = asset_values["NR"]
        elif "modificación" in threat_lower or "modificacion" in threat_lower:
            values["D"] = asset_values["D"]
            values["I"] = min(10, asset_values["I"] + 2)
            values["C"] = asset_values["C"]
            values["A"] = min(10, asset_values["A"] + 1)
            values["NR"] = min(10, asset_values["NR"] + 1)
        elif "fuga" in threat_lower or "divulgación" in threat_lower or "divulgacion" in threat_lower:
            values["D"] = max(1, asset_values["D"] - 1)
            values["I"] = asset_values["I"]
            values["C"] = min(10, asset_values["C"] + 3)
            values["A"] = asset_values["A"]
            values["NR"] = asset_values["NR"]
        elif "degradación" in threat_lower or "degradacion" in threat_lower:
            values["D"] = min(10, asset_values["D"] + 2)
            values["I"] = min(10, asset_values["I"] + 1)
            values["C"] = asset_values["C"]
            values["A"] = asset_values["A"]
            values["NR"] = asset_values["NR"]
        elif "interrupción" in threat_lower or "interrupcion" in threat_lower:
            values["D"] = min(10, asset_values["D"] + 3)
            values["I"] = max(1, asset_values["I"] - 1)
            values["C"] = max(1, asset_values["C"] - 1)
            values["A"] = max(1, asset_values["A"] - 1)
            values["NR"] = max(1, asset_values["NR"] - 1)
        else:
            values["D"] = min(10, asset_values["D"] + 1)
            values["I"] = min(10, asset_values["I"] + 1)
            values["C"] = asset_values["C"]
            values["A"] = asset_values["A"]
            values["NR"] = asset_values["NR"]
    
    # Attacks (A.*)
    elif threat_code.startswith("A") or "ataque" in threat_lower or "manipulación" in threat_lower:
        if "divulgación" in threat_lower or "divulgacion" in threat_lower:
            values["D"] = asset_values["D"]
            values["I"] = asset_values["I"]
            values["C"] = min(10, asset_values["C"] + 4)
            values["A"] = min(10, asset_values["A"] + 1)
            values["NR"] = min(10, asset_values["NR"] + 1)
        elif "modificación" in threat_lower or "modificacion" in threat_lower:
            values["D"] = asset_values["D"]
            values["I"] = min(10, asset_values["I"] + 4)
            values["C"] = asset_values["C"]
            values["A"] = min(10, asset_values["A"] + 3)
            values["NR"] = min(10, asset_values["NR"] + 2)
        elif "destrucción" in threat_lower or "destruccion" in threat_lower:
            values["D"] = min(10, asset_values["D"] + 4)
            values["I"] = min(10, asset_values["I"] + 4)
            values["C"] = asset_values["C"]
            values["A"] = min(10, asset_values["A"] + 2)
            values["NR"] = min(10, asset_values["NR"] + 1)
        elif "suplantación" in threat_lower or "suplantacion" in threat_lower:
            values["D"] = asset_values["D"]
            values["I"] = min(10, asset_values["I"] + 2)
            values["C"] = min(10, asset_values["C"] + 2)
            values["A"] = min(10, asset_values["A"] + 4)
            values["NR"] = min(10, asset_values["NR"] + 3)
        elif "repudio" in threat_lower:
            values["D"] = max(1, asset_values["D"] - 1)
            values["I"] = asset_values["I"]
            values["C"] = max(1, asset_values["C"] - 1)
            values["A"] = min(10, asset_values["A"] + 2)
            values["NR"] = min(10, asset_values["NR"] + 4)
        elif "uso no previsto" in threat_lower or "abuso" in threat_lower:
            values["D"] = min(10, asset_values["D"] + 1)
            values["I"] = min(10, asset_values["I"] + 2)
            values["C"] = min(10, asset_values["C"] + 2)
            values["A"] = min(10, asset_values["A"] + 1)
            values["NR"] = min(10, asset_values["NR"] + 1)
        else:
            values["D"] = min(10, asset_values["D"] + 2)
            values["I"] = min(10, asset_values["I"] + 2)
            values["C"] = min(10, asset_values["C"] + 2)
            values["A"] = min(10, asset_values["A"] + 2)
            values["NR"] = min(10, asset_values["NR"] + 2)
    
    # Equipment failures (E.*)
    elif threat_code.startswith("E"):
        values["D"] = min(10, asset_values["D"] + 2)
        values["I"] = asset_values["I"]
        values["C"] = max(1, asset_values["C"] - 1)
        values["A"] = max(1, asset_values["A"] - 1)
        values["NR"] = max(1, asset_values["NR"] - 1)
    
    # Default for other threats
    else:
        values["D"] = asset_values["D"]
        values["I"] = asset_values["I"]
        values["C"] = asset_values["C"]
        values["A"] = asset_values["A"]
        values["NR"] = asset_values["NR"]
    
    # Ensure all values are within 1-10 range
    for key in values:
        values[key] = max(1, min(10, values[key]))
    
    return values

def extract_threat_code(threat_text):
    """Extract threat code from text like 'Fuego [N.1]' -> 'N.1'"""
    match = re.search(r'\[([^\]]+)\]', threat_text)
    return match.group(1) if match else ""

# Use COM Automation since openpyxl doesn't preserve Excel colors well
import win32com.client

print("Loading workbook via COM...")
excel = win32com.client.Dispatch("Excel.Application")
excel.Visible = False
excel.DisplayAlerts = False
wb = excel.Workbooks.Open('C:\\Users\\Sebastian\\Documents\\Seguridad_Magerit.xlsx')
ws = wb.Worksheets(1)

# Process rows 15 to 422
print("Processing rows 15 to 422...")
current_asset = None
current_asset_values = None
assets_count = 0
threats_count = 0

for row_num in range(15, 423):
    cell_f = ws.Cells(row_num, 6)  # Column F
    color_index = cell_f.Interior.ColorIndex
    
    # Check if this is an asset (has color index 6 - yellow)
    if color_index == 6:
        # This is an asset row
        current_asset = cell_f.Value
        current_asset_values = get_asset_values(current_asset)
        
        # Assign values to the asset
        ws.Cells(row_num, 7).Value = current_asset_values["D"]   # G - Disponibilidad
        ws.Cells(row_num, 8).Value = current_asset_values["I"]   # H - Integridad
        ws.Cells(row_num, 9).Value = current_asset_values["C"]   # I - Confidencialidad
        ws.Cells(row_num, 10).Value = current_asset_values["A"]  # J - Autenticidad
        ws.Cells(row_num, 11).Value = current_asset_values["NR"] # K - No Repudio
        
        assets_count += 1
        print(f"Row {row_num}: ASSET '{current_asset}' -> D:{current_asset_values['D']}, I:{current_asset_values['I']}, C:{current_asset_values['C']}, A:{current_asset_values['A']}, NR:{current_asset_values['NR']}")
    
    elif current_asset and cell_f.Value:
        # This is a threat row (belongs to current asset)
        threat_name = cell_f.Value
        threat_code = extract_threat_code(threat_name)
        
        # Calculate threat impact based on asset values
        threat_values = get_threat_impact(threat_code, threat_name, current_asset_values)
        
        # Assign values to the threat
        ws.Cells(row_num, 7).Value = threat_values["D"]   # G - Disponibilidad
        ws.Cells(row_num, 8).Value = threat_values["I"]   # H - Integridad
        ws.Cells(row_num, 9).Value = threat_values["C"]   # I - Confidencialidad
        ws.Cells(row_num, 10).Value = threat_values["A"]  # J - Autenticidad
        ws.Cells(row_num, 11).Value = threat_values["NR"] # K - No Repudio
        
        threats_count += 1
        print(f"Row {row_num}: THREAT '{threat_name}' [{threat_code}] -> D:{threat_values['D']}, I:{threat_values['I']}, C:{threat_values['C']}, A:{threat_values['A']}, NR:{threat_values['NR']}")

# Save and close
print("\nSaving workbook...")
wb.Save()
wb.Close()
excel.Quit()
print("Values assigned successfully!")
print(f"Total rows processed: {422 - 15 + 1}")
print(f"Assets processed: {assets_count}")
print(f"Threats processed: {threats_count}")

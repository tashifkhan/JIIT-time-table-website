# Import and expose the time_table_creator function directly
from modules.BE62_creator import time_table_creator
from modules.BE128_creator import time_table_creator128

# Ensure the function is available in global scope
# globals()['time_table_creator'] = time_table_creator

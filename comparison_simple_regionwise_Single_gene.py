# -*- coding: utf-8 -*-
"""
Created on Wed Jul  3 23:31:25 2024

@author: Vyomesh
"""

import pandas as pd
import sys
import os

file_path = sys.argv[1]
gene_of_interest = sys.argv[2]
sample_of_interest = sys.argv[3]
samples_to_compare = sys.argv[4].split(',')
run_name = sys.argv[5]
output_dir = sys.argv[6]
print (output_dir)
# Read data from the Excel file into a DataFrame
dragen_coverage_df = pd.read_excel(file_path)

cap_reg_readcount_df = dragen_coverage_df[dragen_coverage_df['gene_name'] == gene_of_interest]

# Count the number of regions for the current gene
num_regions = len(cap_reg_readcount_df['Combined_info'].unique())
# Set the amplification threshold based on the number of regions
amplification_threshold = int(0.8 * num_regions)  # You can adjust the percentage as needed
# Initialize a counter for amplified regions
amplified_region_count = 0

# Create a new DataFrame to store the results
result_data = []

# Calculate fold change and add as a new column
fold_changes = []

for i, row in cap_reg_readcount_df.iterrows():
    total_cvg_sample1 = row[f'total_cvg_{sample_of_interest}']
    total_cvg_other_samples = row[[f'total_cvg_{sample}' for sample in samples_to_compare]].median()
    
    if total_cvg_sample1 == 0 or total_cvg_other_samples == 0:
        fold_change = 0
    else:
        fold_change = total_cvg_sample1 / total_cvg_other_samples
    
    fold_changes.append(fold_change)

# Avoid SettingWithCopyWarning by using .loc
cap_reg_readcount_df.loc[:, 'fold_change'] = fold_changes
cap_reg_readcount_df = cap_reg_readcount_df.round(4)

amplified_region_count = sum(cap_reg_readcount_df['fold_change'] >= 1.5)   

# Determine amplification_status
if amplified_region_count >= amplification_threshold:
    amplification_status = 'Amplified'
elif 4 < amplified_region_count < amplification_threshold:
    amplification_status = 'Not Amplified-Few captured Region Show high depth'
else:
    amplification_status = 'Not Amplified'

mean_fold_change = cap_reg_readcount_df['fold_change'].mean()
median_fold_change = cap_reg_readcount_df['fold_change'].median()

result_data.append({'Gene_Name': gene_of_interest, 'Median_FoldChange': median_fold_change, 'Amplification_Status': amplification_status})

# Create a DataFrame from result_data
result_df = pd.DataFrame(result_data)

# Construct the column names to keep
columns_to_keep = ['#chrom', 'start', 'end', 'gene_name', 'Combined_info', f'total_cvg_{sample_of_interest}']
columns_to_keep += [f'total_cvg_{sample}' for sample in samples_to_compare]
columns_to_keep += ['fold_change']

# Filter the dataframe to keep only the specified columns
cap_reg_readcount_df_1 = cap_reg_readcount_df[columns_to_keep]

output_filename_1 = os.path.join(output_dir, f'{sample_of_interest}_{gene_of_interest}_{run_name}_AmpStatus.csv')
print (output_filename_1)
output_summary_1 = os.path.join(output_dir, f'{sample_of_interest}_{gene_of_interest}_{run_name}_Summary.csv') 
print (output_summary_1)

# Create CSV files
cap_reg_readcount_df_1.to_csv(output_filename_1, index=False)
result_df.to_csv(output_summary_1, index=False)


# -*- coding: utf-8 -*-
"""
Created on Mon Jul  8 11:49:51 2024

@author: Vyomesh
Description: Create a Heat map
"""

import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt
import numpy as np
import sys
import os

# List of genes of interest
gene_requested = sys.argv[1]
data_file = sys.argv[2]
print (data_file)
run_name = sys.argv[3]
output_dir = sys.argv[4]
print (output_dir)
main_sample_id = sys.argv[5]
#os.environ['XDG_RUNTIME_DIR'] = output_dir
# Ensure output directory exists
#os.makedirs(output_dir, exist_ok=True)
current_directory = os.getcwd()
print (current_directory)
os.environ['XDG_RUNTIME_DIR'] = current_directory

# Verify that the variable is set
print('XDG_RUNTIME_DIR:', os.environ.get('XDG_RUNTIME_DIR'))
# Function to generate heatmap for a given gene
def generate_heatmap_for_gene(gene, data_file, output_dir):
    # Extract the sample ID from the data file name
    #sample_id_interest = data_file.split('_')[0]
    sample_id_interest = main_sample_id
    print (sample_id_interest)
    # Read the Excel file and create a DataFrame
    data = pd.read_csv(data_file)
    data.columns = data.columns.str.replace('total_cvg_', '')
    # Filter data for the specified gene
    gene_data = data[data['gene_name'] == gene].drop(columns=['#chrom', 'start', 'end', 'gene_name', 'fold_change'])
    # Set the 'Combined_info' column as the index
    gene_data.set_index('Combined_info', inplace=True)
    # Convert the data to log base 10
    log_gene_data = np.log(gene_data + 1)
    # Generate a light shades color palette
    base_color = "#8AA0FE"  # Example base color
    n_colors = len(log_gene_data.columns)  # Number of samples
    light_palette = sns.light_palette(base_color, n_colors=n_colors)
    # Generate the heatmap
    plt.figure(figsize=(10, 6))
    heatmap = sns.heatmap(log_gene_data, cmap=light_palette, annot=True, fmt='.2f', cbar=True, cbar_kws={'label': 'Natural Log'})
    # Customize the text properties to color the numeric values in black
    sns.heatmap(log_gene_data, cmap=light_palette, annot=True, fmt='.2f', cbar=False, annot_kws={'color': 'black'})
    # Add labels and title
    plt.title(f'CNA {gene} gene ')
    # Set the Y-axis tick labels explicitly (gene names)
    plt.yticks(np.arange(len(log_gene_data.index)) + 0.5, log_gene_data.index, rotation=0, fontsize=6)
    plt.xticks(np.arange(len(log_gene_data.columns)) + 0.5, log_gene_data.columns, rotation=25, ha='right', fontstyle='italic', fontsize=6)
    # Customize the Y-axis tick labels as italics
    ax = plt.gca()
    ax.set_yticklabels(ax.get_yticklabels(), fontstyle='italic')
    # Save the plot as a PNG image (if needed)
    print (output_dir)
    output_filepath = output_dir +"/"+ sample_id_interest + '_' + gene + '_' + run_name + '_heatmap.png'
    #output_filepath = os.path.join(output_dir, f'{sample_id_interest}_{gene}_{run_name}_heatmap.png')
    print (output_filepath)
    plt.savefig(output_filepath, dpi=500, bbox_inches='tight')
    plt.close()

generate_heatmap_for_gene(gene_requested, data_file, output_dir)


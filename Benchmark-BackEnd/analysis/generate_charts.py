import json
import os
import glob
import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd
import numpy as np
from pathlib import Path

# Configuration du style
sns.set_theme(style="whitegrid")
plt.rcParams['figure.figsize'] = (14, 8)

def load_k6_results(results_dir='../results'):
    """Load all k6 JSON result files"""
    results = {}
    
    # Handle both relative and absolute paths
    script_dir = Path(__file__).parent.parent
    results_path = script_dir / 'results'
    
    for file in glob.glob(f'{results_path}/*_summary.json'):
        filename = os.path.basename(file)
        service_name = filename.replace('_summary.json', '')
        
        with open(file, 'r') as f:
            data = json.load(f)
            results[service_name] = data
    
    return results

def extract_metrics(results):
    """Extract key metrics from k6 results"""
    metrics_data = []
    
    for service, data in results.items():
        metrics = data.get('metrics', {})
        
        # Extract HTTP request duration
        http_req_duration = metrics.get('http_req_duration', {})
        values = http_req_duration.get('values', {})
        
        # Extract HTTP requests per second
        http_reqs = metrics.get('http_reqs', {})
        
        # Extract failed requests
        http_req_failed = metrics.get('http_req_failed', {})
        
        # Extract data received/sent
        data_received = metrics.get('data_received', {})
        data_sent = metrics.get('data_sent', {})
        
        # Extract values from nested structure
        http_reqs_values = http_reqs.get('values', {})
        http_req_failed_values = http_req_failed.get('values', {})
        data_received_values = data_received.get('values', {})
        data_sent_values = data_sent.get('values', {})
        
        metrics_data.append({
            'service': service,
            'avg_latency': values.get('avg', 0),
            'p95_latency': values.get('p(95)', 0),
            'p99_latency': values.get('p(99)', 0),
            'min_latency': values.get('min', 0),
            'max_latency': values.get('max', 0),
            'median_latency': values.get('med', 0),
            'total_requests': http_reqs_values.get('count', 0),
            'rps': http_reqs_values.get('rate', 0),
            'failed_rate': http_req_failed_values.get('rate', 0) * 100,
            'data_received_mb': data_received_values.get('count', 0) / (1024 * 1024),
            'data_sent_mb': data_sent_values.get('count', 0) / (1024 * 1024),
        })
    
    return pd.DataFrame(metrics_data)

def plot_latency_comparison(df, output_dir=None):
    """Create latency comparison chart"""
    if output_dir is None:
        output_dir = Path(__file__).parent.parent / 'results'
    fig, ax = plt.subplots(figsize=(14, 8))
    
    x = np.arange(len(df['service']))
    width = 0.25
    
    ax.bar(x - width, df['avg_latency'], width, label='Moyenne', color='#3498db')
    ax.bar(x, df['p95_latency'], width, label='P95', color='#e74c3c')
    ax.bar(x + width, df['p99_latency'], width, label='P99', color='#f39c12')
    
    ax.set_xlabel('Service', fontsize=12, fontweight='bold')
    ax.set_ylabel('Latence (ms)', fontsize=12, fontweight='bold')
    ax.set_title('Comparaison des Latences - Benchmarks Multi-Théâtres', 
                 fontsize=14, fontweight='bold', pad=20)
    ax.set_xticks(x)
    ax.set_xticklabels(df['service'], rotation=45, ha='right')
    ax.legend()
    ax.grid(axis='y', alpha=0.3)
    
    plt.tight_layout()
    plt.savefig(f'{output_dir}/latency_comparison.png', dpi=300, bbox_inches='tight')
    print(f"✓ Graphique de latence sauvegardé: {output_dir}/latency_comparison.png")
    plt.close()

def plot_throughput_comparison(df, output_dir=None):
    """Create throughput (RPS) comparison chart"""
    if output_dir is None:
        output_dir = Path(__file__).parent.parent / 'results'
    fig, ax = plt.subplots(figsize=(12, 7))
    
    bars = ax.barh(df['service'], df['rps'], color=sns.color_palette("viridis", len(df)))
    
    # Add value labels on bars
    for i, bar in enumerate(bars):
        width = bar.get_width()
        ax.text(width, bar.get_y() + bar.get_height()/2, 
                f'{width:.0f} req/s', 
                ha='left', va='center', fontsize=10, fontweight='bold')
    
    ax.set_xlabel('Requêtes par seconde (RPS)', fontsize=12, fontweight='bold')
    ax.set_ylabel('Service', fontsize=12, fontweight='bold')
    ax.set_title('Comparaison du Débit (Throughput) - Benchmarks Multi-Théâtres', 
                 fontsize=14, fontweight='bold', pad=20)
    ax.grid(axis='x', alpha=0.3)
    
    plt.tight_layout()
    plt.savefig(f'{output_dir}/throughput_comparison.png', dpi=300, bbox_inches='tight')
    print(f"✓ Graphique de débit sauvegardé: {output_dir}/throughput_comparison.png")
    plt.close()

def plot_performance_matrix(df, output_dir=None):
    """Create performance matrix heatmap"""
    if output_dir is None:
        output_dir = Path(__file__).parent.parent / 'results'
    fig, ax = plt.subplots(figsize=(12, 8))
    
    # Normalize data for better visualization
    normalized_data = df[['avg_latency', 'p99_latency', 'rps', 'failed_rate']].copy()
    
    # Invert RPS (higher is better) for consistent coloring
    normalized_data['rps'] = 1 / (normalized_data['rps'] + 1)
    
    # Normalize to 0-100 scale
    for col in normalized_data.columns:
        max_val = normalized_data[col].max()
        if max_val > 0:
            normalized_data[col] = (normalized_data[col] / max_val) * 100
    
    normalized_data.index = df['service']
    normalized_data.columns = ['Latence Moy.', 'Latence P99', 'Débit (inv)', 'Taux Échec']
    
    sns.heatmap(normalized_data.T, annot=True, fmt='.1f', cmap='RdYlGn_r', 
                cbar_kws={'label': 'Score (plus bas = meilleur)'}, ax=ax)
    
    ax.set_title('Matrice de Performance - Benchmarks Multi-Théâtres', 
                 fontsize=14, fontweight='bold', pad=20)
    ax.set_xlabel('Service', fontsize=12, fontweight='bold')
    ax.set_ylabel('Métriques', fontsize=12, fontweight='bold')
    
    plt.tight_layout()
    plt.savefig(f'{output_dir}/performance_matrix.png', dpi=300, bbox_inches='tight')
    print(f"✓ Matrice de performance sauvegardée: {output_dir}/performance_matrix.png")
    plt.close()

def plot_failure_rate(df, output_dir=None):
    """Create failure rate comparison"""
    if output_dir is None:
        output_dir = Path(__file__).parent.parent / 'results'
    fig, ax = plt.subplots(figsize=(12, 6))
    
    colors = ['#27ae60' if rate < 1 else '#e74c3c' for rate in df['failed_rate']]
    bars = ax.bar(df['service'], df['failed_rate'], color=colors, alpha=0.7)
    
    # Add threshold line
    ax.axhline(y=1, color='red', linestyle='--', label='Seuil acceptable (1%)', linewidth=2)
    
    ax.set_xlabel('Service', fontsize=12, fontweight='bold')
    ax.set_ylabel('Taux d\'échec (%)', fontsize=12, fontweight='bold')
    ax.set_title('Taux d\'Échec des Requêtes - Benchmarks Multi-Théâtres', 
                 fontsize=14, fontweight='bold', pad=20)
    ax.set_xticklabels(df['service'], rotation=45, ha='right')
    ax.legend()
    ax.grid(axis='y', alpha=0.3)
    
    plt.tight_layout()
    plt.savefig(f'{output_dir}/failure_rate.png', dpi=300, bbox_inches='tight')
    print(f"✓ Graphique de taux d'échec sauvegardé: {output_dir}/failure_rate.png")
    plt.close()

def plot_comprehensive_comparison(df, output_dir=None):
    """Create a comprehensive 2x2 comparison grid"""
    if output_dir is None:
        output_dir = Path(__file__).parent.parent / 'results'
    fig, axes = plt.subplots(2, 2, figsize=(16, 12))
    
    # 1. Latency comparison
    ax = axes[0, 0]
    x = np.arange(len(df['service']))
    width = 0.35
    ax.bar(x - width/2, df['avg_latency'], width, label='Moyenne', alpha=0.8)
    ax.bar(x + width/2, df['p99_latency'], width, label='P99', alpha=0.8)
    ax.set_ylabel('Latence (ms)')
    ax.set_title('Latence')
    ax.set_xticks(x)
    ax.set_xticklabels(df['service'], rotation=45, ha='right')
    ax.legend()
    ax.grid(axis='y', alpha=0.3)
    
    # 2. Throughput
    ax = axes[0, 1]
    ax.bar(df['service'], df['rps'], color=sns.color_palette("viridis", len(df)))
    ax.set_ylabel('Requêtes/seconde')
    ax.set_title('Débit (RPS)')
    ax.set_xticklabels(df['service'], rotation=45, ha='right')
    ax.grid(axis='y', alpha=0.3)
    
    # 3. Total requests
    ax = axes[1, 0]
    ax.bar(df['service'], df['total_requests'], color=sns.color_palette("mako", len(df)))
    ax.set_ylabel('Nombre total de requêtes')
    ax.set_title('Volume Total Traité')
    ax.set_xticklabels(df['service'], rotation=45, ha='right')
    ax.grid(axis='y', alpha=0.3)
    
    # 4. Failure rate
    ax = axes[1, 1]
    colors = ['#27ae60' if rate < 1 else '#e74c3c' for rate in df['failed_rate']]
    ax.bar(df['service'], df['failed_rate'], color=colors, alpha=0.7)
    ax.axhline(y=1, color='red', linestyle='--', linewidth=2, label='Seuil 1%')
    ax.set_ylabel('Taux d\'échec (%)')
    ax.set_title('Fiabilité')
    ax.set_xticklabels(df['service'], rotation=45, ha='right')
    ax.legend()
    ax.grid(axis='y', alpha=0.3)
    
    fig.suptitle('Vue d\'Ensemble Complète - Benchmarks Multi-Théâtres', 
                 fontsize=16, fontweight='bold', y=1.00)
    
    plt.tight_layout()
    plt.savefig(f'{output_dir}/comprehensive_comparison.png', dpi=300, bbox_inches='tight')
    print(f"✓ Graphique complet sauvegardé: {output_dir}/comprehensive_comparison.png")
    plt.close()

def export_csv(df, output_dir=None):
    """Export metrics to CSV"""
    if output_dir is None:
        output_dir = Path(__file__).parent.parent / 'results'
    csv_path = f'{output_dir}/benchmark_metrics.csv'
    df.to_csv(csv_path, index=False, float_format='%.2f')
    print(f"✓ Métriques exportées en CSV: {csv_path}")

def main():
    print("=" * 60)
    print("  GÉNÉRATION DES GRAPHIQUES DE BENCHMARK")
    print("=" * 60)
    print()
    
    # Load results
    print("📂 Chargement des résultats k6...")
    results = load_k6_results()
    
    if not results:
        print("❌ Aucun résultat trouvé. Exécutez d'abord les tests k6.")
        return
    
    print(f"✓ {len(results)} services trouvés: {', '.join(results.keys())}")
    print()
    
    # Extract metrics
    print("📊 Extraction des métriques...")
    df = extract_metrics(results)
    
    # Sort by RPS for better visualization
    df = df.sort_values('rps', ascending=False)
    
    print("✓ Métriques extraites")
    print()
    
    # Generate all charts
    print("🎨 Génération des graphiques...")
    plot_latency_comparison(df)
    plot_throughput_comparison(df)
    plot_performance_matrix(df)
    plot_failure_rate(df)
    plot_comprehensive_comparison(df)
    
    print()
    
    # Export CSV
    print("💾 Export des données...")
    export_csv(df)
    
    print()
    print("=" * 60)
    print("✅ GÉNÉRATION TERMINÉE AVEC SUCCÈS!")
    print("=" * 60)
    print()
    print("📁 Les fichiers suivants ont été créés dans /results:")
    print("   - latency_comparison.png")
    print("   - throughput_comparison.png")
    print("   - performance_matrix.png")
    print("   - failure_rate.png")
    print("   - comprehensive_comparison.png")
    print("   - benchmark_metrics.csv")

if __name__ == '__main__':
    main()

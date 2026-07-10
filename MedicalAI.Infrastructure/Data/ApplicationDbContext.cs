using MedicalAI.Core.Entities;
using Microsoft.EntityFrameworkCore;

namespace MedicalAI.Infrastructure.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    // Khai báo bảng Users
    public DbSet<User> Users { get; set; }
    public DbSet<HealthCheckup> HealthCheckups { get; set; }
    public DbSet<MedicalMetric> MedicalMetrics { get; set; }
    public DbSet<PredictionResult> PredictionResults { get; set; }
    public DbSet<RefreshToken> RefreshTokens { get; set; }
    public DbSet<Notification> Notifications { get; set; }
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Đảm bảo Email không được trùng lặp
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        modelBuilder.Entity<HealthCheckup>()
            .HasOne(c => c.MedicalMetric)
            .WithOne(m => m.HealthCheckup)
            .HasForeignKey<MedicalMetric>(m => m.CheckupId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<HealthCheckup>()
            .HasMany(c => c.PredictionResults)
            .WithOne(p => p.HealthCheckup)
            .HasForeignKey(p => p.CheckupId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}